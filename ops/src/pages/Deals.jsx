import React, { useMemo, useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { Icon } from '../components/Icons.jsx'
import {
  Badge,
  EmptyState,
  Modal,
  SearchBar,
  FilterTabs,
  FAB,
  Field,
  Select,
  paymentTone,
  stageTone,
} from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { money, formatDate, todayISO } from '../services/format.js'
import { dealPaid, dealBalance, derivePaymentStatus } from '../services/selectors.js'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending Payment' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'closed', label: 'Closed' },
]

const DESTINATIONS = [
  'Mali (West Africa)',
  'Burkina Faso (West Africa)',
  'Gambia (West Africa)',
  'Nigeria (West Africa)',
  'Togo (West Africa)',
  'Guinea (West Africa)',
  'South America',
  'Middle East',
  'Other',
]

const emptyDeal = () => ({
  buyer: '',
  contactPerson: '',
  panelBrand: '',
  wattage: '',
  quantityPanels: '',
  quantityPallets: '',
  containers: '',
  pricePerPanel: '',
  totalValue: '',
  paymentStatus: 'Pending',
  invoiceNumber: '',
  incoterm: 'FOB Origin',
  destination: 'Mali (West Africa)',
  stage: 'Lead',
  notes: '',
})

export default function Deals({ title, onMenu, Header }) {
  const { store, settings, insert, update, remove, logActivity } = useData()
  const opts = { locale: settings.locale, currency: settings.currency }
  const deals = store.deals || []
  const payments = store.payments || []

  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detailId, setDetailId] = useState(null)

  const stages = settings.dealStages || []

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return deals.filter((d) => {
      const status = derivePaymentStatus(d, payments)
      if (filter === 'active' && (d.stage === 'Paid in Full')) return false
      if (filter === 'pending' && status === 'Paid') return false
      if (filter === 'shipped' && !['Shipped', 'Loading'].includes(d.stage)) return false
      if (filter === 'closed' && d.stage !== 'Paid in Full') return false
      if (!term) return true
      return (
        d.buyer?.toLowerCase().includes(term) ||
        d.invoiceNumber?.toLowerCase().includes(term) ||
        d.destination?.toLowerCase().includes(term) ||
        d.contactPerson?.toLowerCase().includes(term)
      )
    })
  }, [deals, payments, filter, q])

  const openAdd = () => {
    setEditing(emptyDeal())
    setFormOpen(true)
  }
  const openEdit = (d) => {
    setEditing(d)
    setFormOpen(true)
  }

  const saveDeal = async (data) => {
    const clean = {
      ...data,
      wattage: Number(data.wattage) || 0,
      quantityPanels: Number(data.quantityPanels) || 0,
      quantityPallets: Number(data.quantityPallets) || 0,
      containers: Number(data.containers) || 0,
      pricePerPanel: Number(data.pricePerPanel) || 0,
      totalValue: Number(data.totalValue) || 0,
    }
    if (data.id) {
      await update('deals', data.id, clean)
    } else {
      await insert('deals', clean)
      await logActivity('deal', `Deal added — ${clean.buyer || 'New buyer'}`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const detail = deals.find((d) => d.id === detailId)

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        <div className="space-y-3">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search buyer, invoice #, destination…"
          />
          <FilterTabs tabs={FILTERS} value={filter} onChange={setFilter} />
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon="deals"
              title="No deals yet"
              subtitle="Add your first deal to start tracking the sales pipeline."
              action={
                <button className="btn-gold" onClick={openAdd}>
                  <Icon.plus size={20} /> Add Deal
                </button>
              }
            />
          ) : (
            filtered.map((d) => (
              <DealCard
                key={d.id}
                deal={d}
                payments={payments}
                opts={opts}
                onOpen={() => setDetailId(d.id)}
              />
            ))
          )}
        </div>
      </Page>

      <FAB onClick={openAdd} label="Add Deal" />

      <DealForm
        open={formOpen}
        initial={editing}
        stages={stages}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={saveDeal}
      />

      <DealDetail
        deal={detail}
        payments={payments}
        opts={opts}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          openEdit(detail)
          setDetailId(null)
        }}
        onDelete={async () => {
          await remove('deals', detail.id)
          setDetailId(null)
        }}
      />
    </>
  )
}

/* --------------------------------------------------------------- Card */
function DealCard({ deal, payments, opts, onOpen }) {
  const status = derivePaymentStatus(deal, payments)
  const balance = dealBalance(deal, payments)
  const qty = deal.quantityPallets
    ? `${deal.quantityPallets.toLocaleString()} pallets`
    : deal.quantityPanels
    ? `${deal.quantityPanels.toLocaleString()} panels`
    : '—'
  return (
    <button onClick={onOpen} className="card w-full p-4 text-left active:scale-[.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-bold text-navy">{deal.buyer}</div>
          {deal.contactPerson && (
            <div className="truncate text-sm text-slate-500">{deal.contactPerson}</div>
          )}
        </div>
        <Badge tone={paymentTone(status)}>{status}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone={stageTone(deal.stage)}>{deal.stage}</Badge>
        {deal.panelBrand && (
          <Badge tone="slate">
            {deal.panelBrand}
            {deal.wattage ? ` ${deal.wattage}W` : ''}
          </Badge>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <Meta label="Quantity" value={qty} />
        <Meta label="Containers" value={deal.containers || '—'} />
        <Meta label="Total" value={deal.totalValue ? money(deal.totalValue, opts) : '—'} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Icon.pin size={14} /> {deal.destination || '—'}
        </span>
        {balance > 0 && deal.totalValue > 0 && (
          <span className="font-semibold text-gold">{money(balance, opts)} due</span>
        )}
      </div>
    </button>
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

/* --------------------------------------------------------------- Form */
function DealForm({ open, initial, stages, onClose, onSave }) {
  const [data, setData] = useState(initial || emptyDeal())
  React.useEffect(() => {
    setData(initial || emptyDeal())
  }, [initial, open])

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? 'Edit Deal' : 'Add Deal'}
      footer={
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-gold flex-1" onClick={() => onSave(data)}>
            Save Deal
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Buyer / Company">
            <input className="input" value={data.buyer} onChange={set('buyer')} placeholder="FabTech Solar Solutions" />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Contact person">
            <input className="input" value={data.contactPerson} onChange={set('contactPerson')} />
          </Field>
        </div>
        <Field label="Panel brand">
          <input className="input" value={data.panelBrand} onChange={set('panelBrand')} placeholder="Boviet" />
        </Field>
        <Field label="Wattage (W)">
          <input className="input" inputMode="numeric" value={data.wattage} onChange={set('wattage')} placeholder="545" />
        </Field>
        <Field label="Quantity (panels)">
          <input className="input" inputMode="numeric" value={data.quantityPanels} onChange={set('quantityPanels')} />
        </Field>
        <Field label="Quantity (pallets)">
          <input className="input" inputMode="numeric" value={data.quantityPallets} onChange={set('quantityPallets')} />
        </Field>
        <Field label="Containers">
          <input className="input" inputMode="numeric" value={data.containers} onChange={set('containers')} />
        </Field>
        <Field label="Price / panel">
          <input className="input" inputMode="decimal" value={data.pricePerPanel} onChange={set('pricePerPanel')} placeholder="9" />
        </Field>
        <div className="col-span-2">
          <Field label="Total deal value ($)" hint="Leave blank to skip; used for balance tracking.">
            <input className="input" inputMode="decimal" value={data.totalValue} onChange={set('totalValue')} />
          </Field>
        </div>
        <Field label="Invoice #">
          <input className="input" value={data.invoiceNumber} onChange={set('invoiceNumber')} placeholder="AES-2026-…" />
        </Field>
        <Field label="Incoterm">
          <input className="input" value={data.incoterm} onChange={set('incoterm')} />
        </Field>
        <div className="col-span-2">
          <Field label="Destination">
            <Select value={data.destination} onChange={set('destination')} options={DESTINATIONS} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Pipeline stage">
            <Select value={data.stage} onChange={set('stage')} options={stages} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Payment status">
            <Select
              value={data.paymentStatus}
              onChange={set('paymentStatus')}
              options={['Pending', 'Partial', 'Paid', 'Overdue']}
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Notes" hint="Warranty, flash-test status, special terms…">
            <textarea className="input min-h-[80px]" value={data.notes} onChange={set('notes')} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

/* --------------------------------------------------------------- Detail */
function DealDetail({ deal, payments, opts, onClose, onEdit, onDelete }) {
  const { insert, remove, logActivity } = useData()
  const [payOpen, setPayOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [method, setMethod] = useState('Zelle')
  const [note, setNote] = useState('')

  if (!deal) return null
  const dealPayments = payments.filter((p) => p.dealId === deal.id)
  const paid = dealPaid(deal, payments)
  const balance = dealBalance(deal, payments)
  const status = derivePaymentStatus(deal, payments)

  const addPayment = async () => {
    const amt = Number(amount)
    if (!amt) return
    await insert('payments', { dealId: deal.id, amount: amt, date, method, note })
    await logActivity('payment', `Payment received — ${money(amt, opts)} from ${deal.buyer}`)
    setAmount('')
    setNote('')
    setPayOpen(false)
  }

  return (
    <Modal
      open={!!deal}
      onClose={onClose}
      wide
      title={deal.buyer}
      footer={
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onEdit}>
            <Icon.edit size={18} /> Edit
          </button>
          <button
            className="btn-ghost flex-1 !text-rose-600"
            onClick={() => {
              if (confirm('Delete this deal?')) onDelete()
            }}
          >
            <Icon.trash size={18} /> Delete
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        <Badge tone={stageTone(deal.stage)}>{deal.stage}</Badge>
        <Badge tone={paymentTone(status)}>{status}</Badge>
        {deal.invoiceNumber && <Badge tone="slate">#{deal.invoiceNumber}</Badge>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="Contact" value={deal.contactPerson || '—'} />
        <Info label="Destination" value={deal.destination || '—'} />
        <Info label="Panel" value={`${deal.panelBrand || '—'}${deal.wattage ? ` ${deal.wattage}W` : ''}`} />
        <Info label="Incoterm" value={deal.incoterm || '—'} />
        <Info
          label="Quantity"
          value={
            deal.quantityPallets
              ? `${deal.quantityPallets.toLocaleString()} pallets`
              : deal.quantityPanels
              ? `${deal.quantityPanels.toLocaleString()} panels`
              : '—'
          }
        />
        <Info label="Containers" value={deal.containers || '—'} />
        <Info label="Price / panel" value={deal.pricePerPanel ? money(deal.pricePerPanel, opts) : '—'} />
        <Info label="Total value" value={deal.totalValue ? money(deal.totalValue, opts) : '—'} />
      </div>

      {deal.notes && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{deal.notes}</div>
      )}

      {/* Payment summary */}
      <div className="mt-5 rounded-2xl border border-slate-100 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="font-bold text-navy">{deal.totalValue ? money(deal.totalValue, opts) : '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Paid</div>
            <div className="font-bold text-emerald-600">{money(paid, opts)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Balance</div>
            <div className="font-bold text-gold">{deal.totalValue ? money(balance, opts) : '—'}</div>
          </div>
        </div>
      </div>

      {/* Payment log */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-bold text-navy">Payment log</h4>
          <button className="text-sm font-semibold text-gold" onClick={() => setPayOpen((v) => !v)}>
            {payOpen ? 'Close' : '+ Record payment'}
          </button>
        </div>

        {payOpen && (
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
            <Field label="Amount ($)">
              <input className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Date">
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Method">
              <Select value={method} onChange={(e) => setMethod(e.target.value)} options={['Zelle', 'Cash', 'ACH', 'Check', 'Wire']} />
            </Field>
            <Field label="Note">
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="col-span-2">
              <button className="btn-gold w-full" onClick={addPayment}>
                Add payment
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {dealPayments.length === 0 && (
            <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
              No payments recorded yet.
            </div>
          )}
          {dealPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <div>
                <div className="font-semibold text-navy">{money(p.amount, opts)}</div>
                <div className="text-xs text-slate-400">
                  {formatDate(p.date, opts.locale)} · {p.method}
                  {p.note ? ` · ${p.note}` : ''}
                </div>
              </div>
              <button
                onClick={async () => {
                  await remove('payments', p.id)
                }}
                className="text-slate-300 hover:text-rose-500"
                aria-label="Delete payment"
              >
                <Icon.trash size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-semibold text-navy">{value}</div>
    </div>
  )
}
