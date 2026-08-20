import React, { useMemo, useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { Icon } from '../components/Icons.jsx'
import { Badge, EmptyState, Modal, FAB, Field, Select, FilterTabs } from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { money, weekLabel, weekKey } from '../services/format.js'
import { workerTotal, wageTotal, pieceTotal, fixedWeeklyTotal, payrollWeekTotal } from '../services/selectors.js'
import { downloadCSV } from '../services/exporter.js'

const emptyWorker = () => ({
  name: '',
  type: 'wage',
  dailyRate: '',
  daysWorked: '',
  panels: '',
  ratePerPanel: '',
  siteId: '',
  paid: false,
  method: '',
})

export default function Payroll({ title, onMenu, Header }) {
  const { store, settings, insert, update, remove, logActivity, replaceCollection } = useData()
  const opts = { locale: settings.locale, currency: settings.currency }
  const workers = store.workers || []
  const sites = store.sites || []
  const fixed = store.fixedExpenses || []
  const history = store.payrollWeeks || []

  const [tab, setTab] = useState('current')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [siteOpen, setSiteOpen] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [siteLoc, setSiteLoc] = useState('')

  const wagesTotal = payrollWeekTotal(workers)
  const fixedTotal = fixedWeeklyTotal(fixed)
  const grandTotal = wagesTotal + fixedTotal
  const perDay = grandTotal / 7

  const siteName_ = (id) => sites.find((s) => s.id === id)?.name || 'Unassigned'

  const saveWorker = async (data) => {
    const clean = {
      ...data,
      dailyRate: Number(data.dailyRate) || 0,
      daysWorked: Number(data.daysWorked) || 0,
      panels: Number(data.panels) || 0,
      ratePerPanel: Number(data.ratePerPanel) || 0,
      weekKey: data.weekKey || weekKey(),
    }
    if (data.id) await update('workers', data.id, clean)
    else {
      await insert('workers', clean)
      await logActivity('worker', `Worker added — ${clean.name}`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const togglePaid = async (w) => {
    const paid = !w.paid
    await update('workers', w.id, { paid, method: paid ? w.method || 'Cash' : '' })
    if (paid) await logActivity('worker', `Paid ${w.name} — ${money(workerTotal(w), opts)}`)
  }

  const addSite = async () => {
    if (!siteName.trim()) return
    await insert('sites', { name: siteName.trim(), location: siteLoc.trim() })
    setSiteName('')
    setSiteLoc('')
    setSiteOpen(false)
  }

  const archiveWeek = async () => {
    if (workers.length === 0) return
    if (!confirm('Archive this week and start a fresh one? Worker counts reset to zero.')) return
    const snapshot = {
      weekKey: weekKey(),
      label: weekLabel(),
      wagesTotal,
      fixedTotal,
      grandTotal,
      workers: workers.map((w) => ({
        name: w.name,
        type: w.type,
        dailyRate: w.dailyRate,
        daysWorked: w.daysWorked,
        panels: w.panels,
        ratePerPanel: w.ratePerPanel,
        total: workerTotal(w),
        paid: w.paid,
        method: w.method,
        site: siteName_(w.siteId),
      })),
    }
    await insert('payrollWeeks', snapshot)
    // reset current week counts, keep roster
    const reset = workers.map((w) => ({ ...w, daysWorked: 0, panels: 0, paid: false, method: '', weekKey: weekKey() }))
    await replaceCollection('workers', reset)
    await logActivity('worker', `Payroll week archived — ${weekLabel()}`)
    setTab('history')
  }

  const exportCSV = () => {
    downloadCSV(
      `aes-payroll-${weekKey()}.csv`,
      workers.map((w) => ({
        name: w.name,
        type: w.type,
        site: siteName_(w.siteId),
        dailyRate: w.dailyRate,
        daysWorked: w.daysWorked,
        panels: w.panels,
        ratePerPanel: w.ratePerPanel,
        total: workerTotal(w),
        paid: w.paid ? 'yes' : 'no',
        method: w.method,
      }))
    )
  }

  return (
    <>
      <Header
        title={title}
        onMenu={onMenu}
        right={
          <button onClick={exportCSV} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10" aria-label="Export CSV">
            <Icon.download size={22} />
          </button>
        }
      />
      <Page>
        <FilterTabs
          tabs={[{ value: 'current', label: 'This Week' }, { value: 'history', label: 'History' }]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'current' ? (
          <>
            {/* Summary card */}
            <section className="mt-4 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-5 text-white shadow-card">
              <div className="text-sm text-white/70">{weekLabel()}</div>
              <div className="mt-1 text-3xl font-extrabold">{money(grandTotal, opts)}</div>
              <div className="text-sm text-white/70">Wages + fixed expenses this week</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-xs text-white/70">Wages</div>
                  <div className="font-bold">{money(wagesTotal, opts)}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-xs text-white/70">Fixed</div>
                  <div className="font-bold">{money(fixedTotal, opts)}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-xs text-white/70">Per day</div>
                  <div className="font-bold">{money(perDay, opts)}</div>
                </div>
              </div>
            </section>

            <div className="mt-4 flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-navy">Crew ({workers.length})</h3>
              <div className="flex gap-3">
                <button onClick={() => setSiteOpen(true)} className="text-sm font-semibold text-gold">+ Site</button>
                <button onClick={archiveWeek} className="text-sm font-semibold text-slate-500">Archive week</button>
              </div>
            </div>

            <div className="mt-2 space-y-3">
              {workers.length === 0 ? (
                <EmptyState
                  icon="payroll"
                  title="No workers yet"
                  subtitle="Add your crew to start tracking weekly payroll."
                  action={
                    <button className="btn-gold" onClick={() => { setEditing(emptyWorker()); setFormOpen(true) }}>
                      <Icon.plus size={20} /> Add Worker
                    </button>
                  }
                />
              ) : (
                workers.map((w) => {
                  const total = workerTotal(w)
                  const pct = wagesTotal > 0 ? Math.round((total / wagesTotal) * 100) : 0
                  return (
                    <div key={w.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <button className="min-w-0 text-left" onClick={() => { setEditing(w); setFormOpen(true) }}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy">{w.name}</span>
                            <Badge tone={w.type === 'piece' ? 'navy' : 'slate'}>
                              {w.type === 'piece' ? 'Piece-rate' : 'Wage'}
                            </Badge>
                          </div>
                          <div className="mt-0.5 text-sm text-slate-500">
                            {w.type === 'piece'
                              ? `${(Number(w.panels) || 0).toLocaleString()} panels × ${money(w.ratePerPanel, opts)}`
                              : `${money(w.dailyRate, opts)}/day × ${w.daysWorked || 0} days`}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">{siteName_(w.siteId)}</div>
                        </button>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-navy">{money(total, opts)}</div>
                          {w.type === 'wage' && <div className="text-xs text-slate-400">{pct}% of wages</div>}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <button
                          onClick={() => togglePaid(w)}
                          className={`pill ${w.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-gold-soft text-[#946200]'}`}
                        >
                          {w.paid ? <><Icon.check size={14} /> Paid{w.method ? ` · ${w.method}` : ''}</> : 'Mark paid'}
                        </button>
                        <button onClick={() => { if (confirm('Remove worker?')) remove('workers', w.id) }} className="text-slate-300 hover:text-rose-500">
                          <Icon.trash size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : (
          <HistoryView history={history} opts={opts} onDelete={(id) => remove('payrollWeeks', id)} />
        )}
      </Page>

      {tab === 'current' && (
        <FAB onClick={() => { setEditing(emptyWorker()); setFormOpen(true) }} label="Add Worker" />
      )}

      <WorkerForm
        open={formOpen}
        initial={editing}
        sites={sites}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={saveWorker}
      />

      {/* Add site modal */}
      <Modal
        open={siteOpen}
        onClose={() => setSiteOpen(false)}
        title="Add Site / Crew"
        footer={
          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => setSiteOpen(false)}>Cancel</button>
            <button className="btn-gold flex-1" onClick={addSite}>Add site</button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="Site name">
            <input className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Mesa AZ site" />
          </Field>
          <Field label="Location">
            <input className="input" value={siteLoc} onChange={(e) => setSiteLoc(e.target.value)} placeholder="Mesa, AZ" />
          </Field>
        </div>
      </Modal>
    </>
  )
}

/* --------------------------------------------------------- History view */
function HistoryView({ history, opts, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState icon="clock" title="No archived weeks" subtitle="Archive the current week to build payroll history." />
      </div>
    )
  }
  return (
    <div className="mt-4 space-y-3">
      {history.map((h) => (
        <div key={h.id} className="card p-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-navy">{h.label}</div>
            <button onClick={() => { if (confirm('Delete archived week?')) onDelete(h.id) }} className="text-slate-300 hover:text-rose-500">
              <Icon.trash size={18} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-slate-50 p-2"><div className="text-xs text-slate-400">Wages</div><div className="font-bold text-navy">{money(h.wagesTotal, opts)}</div></div>
            <div className="rounded-lg bg-slate-50 p-2"><div className="text-xs text-slate-400">Fixed</div><div className="font-bold text-navy">{money(h.fixedTotal, opts)}</div></div>
            <div className="rounded-lg bg-slate-50 p-2"><div className="text-xs text-slate-400">Grand</div><div className="font-bold text-navy">{money(h.grandTotal, opts)}</div></div>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {h.workers.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-navy">{w.name} <span className="text-slate-400">· {w.site}</span></span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-navy">{money(w.total, opts)}</span>
                  {w.paid && <Icon.check size={16} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------- Worker form */
function WorkerForm({ open, initial, sites, onClose, onSave }) {
  const [data, setData] = useState(initial || emptyWorker())
  React.useEffect(() => setData(initial || emptyWorker()), [initial, open])
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? 'Edit Worker' : 'Add Worker'}
      footer={
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-gold flex-1" onClick={() => onSave(data)}>Save</button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Name">
            <input className="input" value={data.name} onChange={set('name')} placeholder="Ahassane" />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Pay structure">
            <Select
              value={data.type}
              onChange={set('type')}
              options={[{ value: 'wage', label: 'Weekly wage (daily rate)' }, { value: 'piece', label: 'Piece-rate (per panel)' }]}
            />
          </Field>
        </div>
        {data.type === 'wage' ? (
          <>
            <Field label="Daily rate ($)">
              <input className="input" inputMode="decimal" value={data.dailyRate} onChange={set('dailyRate')} placeholder="160" />
            </Field>
            <Field label="Days worked">
              <input className="input" inputMode="numeric" value={data.daysWorked} onChange={set('daysWorked')} placeholder="5" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Panels processed">
              <input className="input" inputMode="numeric" value={data.panels} onChange={set('panels')} />
            </Field>
            <Field label="Rate / panel ($)">
              <input className="input" inputMode="decimal" value={data.ratePerPanel} onChange={set('ratePerPanel')} />
            </Field>
          </>
        )}
        <div className="col-span-2">
          <Field label="Site / crew">
            <Select
              value={data.siteId}
              onChange={set('siteId')}
              options={[{ value: '', label: 'Unassigned' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
            />
          </Field>
        </div>
        {data.paid && (
          <div className="col-span-2">
            <Field label="Payment method">
              <Select value={data.method} onChange={set('method')} options={['Cash', 'Direct deposit', 'Check']} />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  )
}
