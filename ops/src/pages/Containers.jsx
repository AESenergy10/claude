import React, { useMemo, useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { Icon } from '../components/Icons.jsx'
import { Badge, EmptyState, Modal, SearchBar, FilterTabs, FAB, Field, Select, containerTone } from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate, todayISO } from '../services/format.js'

const SITES = ['Phoenix', 'NJ', 'Virginia', 'Charlotte', 'Texas', 'NY']

const emptyContainer = () => ({
  containerNumber: '',
  site: 'Phoenix',
  panelBrand: '',
  pallets: 19,
  panelsPerPallet: 44,
  panelCount: 836,
  dateLoaded: todayISO(),
  carrier: '',
  forwarder: '',
  dealId: '',
  buyer: '',
  status: 'Loading',
})

export default function Containers({ title, onMenu, Header }) {
  const { store, settings, insert, update, remove, logActivity } = useData()
  const containers = store.containers || []
  const deals = store.deals || []
  const statuses = settings.containerStatuses || []

  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return containers.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false
      if (!term) return true
      return (
        c.containerNumber?.toLowerCase().includes(term) ||
        c.buyer?.toLowerCase().includes(term) ||
        c.site?.toLowerCase().includes(term) ||
        c.panelBrand?.toLowerCase().includes(term)
      )
    })
  }, [containers, filter, q])

  const save = async (data) => {
    const clean = {
      ...data,
      pallets: Number(data.pallets) || 0,
      panelsPerPallet: Number(data.panelsPerPallet) || 0,
      panelCount: Number(data.panelCount) || 0,
    }
    const deal = deals.find((d) => d.id === data.dealId)
    if (deal) clean.buyer = deal.buyer
    if (data.id) await update('containers', data.id, clean)
    else {
      await insert('containers', clean)
      await logActivity('container', `Container ${clean.containerNumber || 'new'} added at ${clean.site}`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        <div className="space-y-3">
          <SearchBar value={q} onChange={setQ} placeholder="Search container #, buyer, site…" />
          <FilterTabs
            tabs={[{ value: 'all', label: 'All' }, ...statuses.map((s) => ({ value: s, label: s }))]}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon="container"
              title="No containers yet"
              subtitle="Log your first container load to track shipments."
              action={
                <button className="btn-gold" onClick={() => { setEditing(emptyContainer()); setFormOpen(true) }}>
                  <Icon.plus size={20} /> Add Container
                </button>
              }
            />
          ) : (
            filtered.map((c) => (
              <button key={c.id} onClick={() => { setEditing(c); setFormOpen(true) }} className="card w-full p-4 text-left active:scale-[.99]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-navy">{c.containerNumber || 'Unnumbered'}</div>
                    <div className="truncate text-sm text-slate-500">{c.buyer || 'No buyer linked'}</div>
                  </div>
                  <Badge tone={containerTone(c.status)}>{c.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <Meta label="Site" value={c.site} />
                  <Meta label="Pallets" value={c.pallets} />
                  <Meta label="Panels" value={(Number(c.panelCount) || 0).toLocaleString()} />
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span className="truncate">{c.panelBrand || '—'}</span>
                  <span>{c.dateLoaded ? formatDate(c.dateLoaded, settings.locale) : 'Not loaded'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </Page>

      <FAB onClick={() => { setEditing(emptyContainer()); setFormOpen(true) }} label="Add Container" />

      <ContainerForm
        open={formOpen}
        initial={editing}
        deals={deals}
        statuses={statuses}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={save}
        onDelete={editing?.id ? async () => { await remove('containers', editing.id); setFormOpen(false); setEditing(null) } : null}
      />
    </>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="truncate font-semibold text-navy">{value}</div>
    </div>
  )
}

function ContainerForm({ open, initial, deals, statuses, onClose, onSave, onDelete }) {
  const [data, setData] = useState(initial || emptyContainer())
  const [autoCalc, setAutoCalc] = useState(true)
  React.useEffect(() => {
    setData(initial || emptyContainer())
    setAutoCalc(true)
  }, [initial, open])

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  // Quick math: pallets × panels-per-pallet = total panels (unless overridden)
  const setPallets = (e) => {
    const pallets = e.target.value
    setData((d) => ({
      ...d,
      pallets,
      panelCount: autoCalc ? (Number(pallets) || 0) * (Number(d.panelsPerPallet) || 0) : d.panelCount,
    }))
  }
  const setPerPallet = (e) => {
    const panelsPerPallet = e.target.value
    setData((d) => ({
      ...d,
      panelsPerPallet,
      panelCount: autoCalc ? (Number(d.pallets) || 0) * (Number(panelsPerPallet) || 0) : d.panelCount,
    }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? 'Edit Container' : 'Add Container'}
      footer={
        <div className="flex gap-3">
          {onDelete && (
            <button className="btn-ghost !text-rose-600" onClick={() => { if (confirm('Delete container?')) onDelete() }}>
              <Icon.trash size={18} />
            </button>
          )}
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-gold flex-1" onClick={() => onSave(data)}>Save</button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Container #">
            <input className="input" value={data.containerNumber} onChange={set('containerNumber')} placeholder="MSKU-772041-3" />
          </Field>
        </div>
        <Field label="Site loaded at">
          <Select value={data.site} onChange={set('site')} options={SITES} />
        </Field>
        <Field label="Status">
          <Select value={data.status} onChange={set('status')} options={statuses} />
        </Field>
        <div className="col-span-2">
          <Field label="Panel brand / wattage">
            <input className="input" value={data.panelBrand} onChange={set('panelBrand')} placeholder="Boviet Solar 545W" />
          </Field>
        </div>

        {/* Quick math helper */}
        <div className="col-span-2 rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panel math</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500">
              <input type="checkbox" checked={autoCalc} onChange={(e) => setAutoCalc(e.target.checked)} />
              Auto-calc
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Pallets">
              <input className="input" inputMode="numeric" value={data.pallets} onChange={setPallets} />
            </Field>
            <Field label="Per pallet">
              <input className="input" inputMode="numeric" value={data.panelsPerPallet} onChange={setPerPallet} />
            </Field>
            <Field label="Total panels">
              <input
                className="input"
                inputMode="numeric"
                value={data.panelCount}
                onChange={(e) => { setAutoCalc(false); setData((d) => ({ ...d, panelCount: e.target.value })) }}
              />
            </Field>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Default ≈19 pallets/container, ~800–950 panels. Editable.
          </p>
        </div>

        <Field label="Date loaded">
          <input className="input" type="date" value={data.dateLoaded} onChange={set('dateLoaded')} />
        </Field>
        <Field label="Trucking carrier">
          <input className="input" value={data.carrier} onChange={set('carrier')} />
        </Field>
        <div className="col-span-2">
          <Field label="Freight forwarder">
            <input className="input" value={data.forwarder} onChange={set('forwarder')} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Linked deal / buyer">
            <Select
              value={data.dealId}
              onChange={set('dealId')}
              options={[{ value: '', label: 'None' }, ...deals.map((d) => ({ value: d.id, label: `${d.buyer}${d.invoiceNumber ? ` · ${d.invoiceNumber}` : ''}` }))]}
            />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
