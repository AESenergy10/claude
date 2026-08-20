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
} from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { money, formatDate, todayISO } from '../services/format.js'
import { fixedWeeklyTotal, expensesInRange, ranges } from '../services/selectors.js'
import { downloadCSV } from '../services/exporter.js'

const emptyExpense = () => ({
  title: '',
  category: 'Trucking/Freight',
  vendor: '',
  amount: '',
  date: todayISO(),
  method: 'Zelle',
  note: '',
  receipt: '',
})

export default function Expenses({ title, onMenu, Header }) {
  const { store, settings, insert, update, remove, replaceCollection, logActivity } = useData()
  const opts = { locale: settings.locale, currency: settings.currency }
  const expenses = store.expenses || []
  const fixed = store.fixedExpenses || []
  const categories = settings.expenseCategories || []

  const [tab, setTab] = useState('variable')
  const [q, setQ] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const weeklyFixed = fixedWeeklyTotal(fixed)
  const monthlyFixed = weeklyFixed * 4.33

  const totals = useMemo(() => {
    const t = ranges.today()
    const w = ranges.week()
    const m = ranges.month()
    return {
      all: expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
      today: expensesInRange(expenses, t.start, t.end),
      week: expensesInRange(expenses, w.start, w.end),
      month: expensesInRange(expenses, m.start, m.end),
    }
  }, [expenses])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return expenses.filter((e) => {
      if (catFilter !== 'all' && e.category !== catFilter) return false
      if (!term) return true
      return (
        e.title?.toLowerCase().includes(term) ||
        e.vendor?.toLowerCase().includes(term) ||
        e.note?.toLowerCase().includes(term) ||
        e.method?.toLowerCase().includes(term)
      )
    })
  }, [expenses, q, catFilter])

  const saveExpense = async (data) => {
    const clean = { ...data, amount: Number(data.amount) || 0 }
    if (data.id) await update('expenses', data.id, clean)
    else {
      await insert('expenses', clean)
      await logActivity('expense', `Expense logged — ${clean.title || clean.category} ${money(clean.amount, opts)}`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const exportCSV = () => {
    downloadCSV(
      `aes-expenses-${todayISO()}.csv`,
      expenses.map((e) => ({
        date: e.date,
        title: e.title,
        category: e.category,
        vendor: e.vendor,
        amount: e.amount,
        method: e.method,
        note: e.note,
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
        {/* Overview */}
        <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-4 text-white shadow-card">
          <h2 className="text-lg font-bold">Expense Overview</h2>
          <p className="text-sm text-white/70">Daily spend and category trends at a glance.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Mini label="Total (all)" value={money(totals.all, opts)} />
            <Mini label="Today" value={money(totals.today, opts)} />
            <Mini label="This week" value={money(totals.week, opts)} />
            <Mini label="This month" value={money(totals.month, opts)} />
          </div>
        </section>

        <div className="mt-4">
          <FilterTabs
            tabs={[
              { value: 'variable', label: 'One-off Expenses' },
              { value: 'fixed', label: 'Fixed Weekly' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'fixed' ? (
          <FixedSection
            fixed={fixed}
            weekly={weeklyFixed}
            monthly={monthlyFixed}
            opts={opts}
            onChange={(rows) => replaceCollection('fixedExpenses', rows)}
          />
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <SearchBar value={q} onChange={setQ} placeholder="Search title, vendor, note…" />
              <FilterTabs
                tabs={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))]}
                value={catFilter}
                onChange={setCatFilter}
              />
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-sm text-slate-500">
              <span className="font-semibold text-navy">Expense Entries</span>
              <span>{filtered.length} records</span>
            </div>

            <div className="mt-2 space-y-3">
              {filtered.length === 0 ? (
                <EmptyState
                  icon="expense"
                  title="No expenses found"
                  subtitle="Add your first expense or adjust the filters to see matching records."
                  action={
                    <button className="btn-gold" onClick={() => { setEditing(emptyExpense()); setFormOpen(true) }}>
                      <Icon.plus size={20} /> Add Expense
                    </button>
                  }
                />
              ) : (
                filtered.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { setEditing(e); setFormOpen(true) }}
                    className="card w-full p-4 text-left active:scale-[.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-bold text-navy">{e.title || e.category}</div>
                        <div className="truncate text-sm text-slate-500">
                          {e.vendor || '—'} · {formatDate(e.date, opts.locale)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-navy">{money(e.amount, opts)}</div>
                        <div className="text-xs text-slate-400">{e.method}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="slate">{e.category}</Badge>
                      {e.note && <span className="truncate text-xs text-slate-400">{e.note}</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </Page>

      {tab === 'variable' && (
        <FAB onClick={() => { setEditing(emptyExpense()); setFormOpen(true) }} label="Add Expense" />
      )}

      <ExpenseForm
        open={formOpen}
        initial={editing}
        categories={categories}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={saveExpense}
        onDelete={editing?.id ? async () => { await remove('expenses', editing.id); setFormOpen(false); setEditing(null) } : null}
      />
    </>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-0.5 text-lg font-bold">{value}</div>
    </div>
  )
}

/* --------------------------------------------------------- Fixed section */
function FixedSection({ fixed, weekly, monthly, opts, onChange }) {
  const setRow = (id, patch) => onChange(fixed.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const addRow = () =>
    onChange([...fixed, { id: `fx_${Date.now()}`, name: 'New expense', dailyRate: 0, daysPerWeek: 0, weeklyTotal: 0 }])
  const delRow = (id) => onChange(fixed.filter((f) => f.id !== id))

  // weeklyTotal can be entered directly, or derived from dailyRate × days
  const recompute = (row) => {
    const derived = (Number(row.dailyRate) || 0) * (Number(row.daysPerWeek) || 0)
    return derived > 0 ? derived : Number(row.weeklyTotal) || 0
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-sm text-slate-500">This Week</div>
          <div className="mt-0.5 text-2xl font-extrabold text-navy">{money(weekly, opts)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">This Month (≈)</div>
          <div className="mt-0.5 text-2xl font-extrabold text-navy">{money(monthly, opts)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-5">Expense</div>
          <div className="col-span-2 text-right">Daily</div>
          <div className="col-span-2 text-right">Days</div>
          <div className="col-span-3 text-right">Weekly</div>
        </div>
        {fixed.map((f) => (
          <div key={f.id} className="grid grid-cols-12 items-center gap-2 border-b border-slate-50 px-3 py-2">
            <input
              className="col-span-5 rounded-lg border border-transparent px-1 py-1 text-sm font-medium text-navy focus:border-slate-200 focus:outline-none"
              value={f.name}
              onChange={(e) => setRow(f.id, { name: e.target.value })}
            />
            <input
              className="col-span-2 rounded-lg border border-slate-100 px-1 py-1 text-right text-sm"
              inputMode="decimal"
              value={f.dailyRate || ''}
              placeholder="0"
              onChange={(e) => {
                const dailyRate = e.target.value
                setRow(f.id, { dailyRate, weeklyTotal: recompute({ ...f, dailyRate }) })
              }}
            />
            <input
              className="col-span-2 rounded-lg border border-slate-100 px-1 py-1 text-right text-sm"
              inputMode="numeric"
              value={f.daysPerWeek || ''}
              placeholder="0"
              onChange={(e) => {
                const daysPerWeek = e.target.value
                setRow(f.id, { daysPerWeek, weeklyTotal: recompute({ ...f, daysPerWeek }) })
              }}
            />
            <div className="col-span-3 flex items-center justify-end gap-1">
              <input
                className="w-20 rounded-lg border border-slate-100 px-1 py-1 text-right text-sm font-semibold"
                inputMode="decimal"
                value={f.weeklyTotal || ''}
                placeholder="0"
                onChange={(e) => setRow(f.id, { weeklyTotal: e.target.value, dailyRate: 0, daysPerWeek: 0 })}
              />
              <button onClick={() => delRow(f.id)} className="text-slate-300 hover:text-rose-500" aria-label="Remove">
                <Icon.trash size={16} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={addRow} className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-gold">
          <Icon.plus size={18} /> Add fixed expense
        </button>
      </div>
      <p className="px-1 text-xs text-slate-400">
        Enter a weekly amount directly, or a daily rate × days/week to auto-calculate.
      </p>
    </div>
  )
}

/* --------------------------------------------------------- Expense form */
function ExpenseForm({ open, initial, categories, onClose, onSave, onDelete }) {
  const [data, setData] = useState(initial || emptyExpense())
  React.useEffect(() => setData(initial || emptyExpense()), [initial, open])
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  const onReceipt = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setData((d) => ({ ...d, receipt: reader.result }))
    reader.readAsDataURL(file)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? 'Edit Expense' : 'Add Expense'}
      footer={
        <div className="flex gap-3">
          {onDelete && (
            <button className="btn-ghost !text-rose-600" onClick={() => { if (confirm('Delete expense?')) onDelete() }}>
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
          <Field label="Title">
            <input className="input" value={data.title} onChange={set('title')} placeholder="Container drayage" />
          </Field>
        </div>
        <Field label="Category">
          <Select value={data.category} onChange={set('category')} options={categories} />
        </Field>
        <Field label="Amount ($)">
          <input className="input" inputMode="decimal" value={data.amount} onChange={set('amount')} />
        </Field>
        <Field label="Vendor">
          <input className="input" value={data.vendor} onChange={set('vendor')} />
        </Field>
        <Field label="Date">
          <input className="input" type="date" value={data.date} onChange={set('date')} />
        </Field>
        <Field label="Payment method">
          <Select value={data.method} onChange={set('method')} options={['Zelle', 'Cash', 'ACH', 'Check', 'Wire']} />
        </Field>
        <div className="col-span-2">
          <Field label="Note">
            <input className="input" value={data.note} onChange={set('note')} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Receipt photo (optional)">
            <input type="file" accept="image/*" onChange={onReceipt} className="text-sm" />
          </Field>
          {data.receipt && (
            <img src={data.receipt} alt="receipt" className="mt-2 max-h-40 rounded-xl border border-slate-200" />
          )}
        </div>
      </div>
    </Modal>
  )
}
