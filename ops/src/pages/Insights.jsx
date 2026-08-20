import React, { useMemo, useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { StatCard, FilterTabs, Field } from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { money, startOfWeek, startOfMonth, endOfMonth, startOfDay, endOfWeek, inRange } from '../services/format.js'
import {
  paymentsInRange,
  expensesInRange,
  fixedWeeklyTotal,
  payrollWeekTotal,
  workerTotal,
} from '../services/selectors.js'

export default function Insights({ title, onMenu, Header }) {
  const { store, settings } = useData()
  const opts = { locale: settings.locale, currency: settings.currency }

  const payments = store.payments || []
  const expenses = store.expenses || []
  const fixed = store.fixedExpenses || []
  const workers = store.workers || []
  const history = store.payrollWeeks || []
  const containers = store.containers || []
  const deals = store.deals || []

  const [range, setRange] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { start, end } = useMemo(() => {
    const now = new Date()
    if (range === 'today') return { start: startOfDay(now), end: new Date(now.setHours(23, 59, 59, 999)) }
    if (range === 'week') return { start: startOfWeek(), end: endOfWeek() }
    if (range === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart + 'T00:00:00'), end: new Date(customEnd + 'T23:59:59') }
    }
    return { start: startOfMonth(), end: endOfMonth() }
  }, [range, customStart, customEnd])

  // Revenue collected = payments in range
  const revenue = paymentsInRange(payments, start, end)
  const variableExp = expensesInRange(expenses, start, end)

  // Payroll paid out in range: current-week workers marked paid (approx by weekKey overlap)
  // plus archived weeks that fall in range.
  const payrollPaid = useMemo(() => {
    let total = 0
    workers.forEach((w) => {
      if (w.paid && inRange(startOfWeek().toISOString(), start, end)) total += workerTotal(w)
    })
    history.forEach((h) => {
      const monday = new Date(h.weekKey + 'T00:00:00')
      if (inRange(monday.toISOString(), start, end)) total += h.grandTotal ? h.wagesTotal : 0
    })
    return total
  }, [workers, history, start, end])

  // Fixed expenses prorated across weeks in range
  const weeklyFixed = fixedWeeklyTotal(fixed)
  const weeksInRange = Math.max(1, Math.round((end - start) / (7 * 24 * 3600 * 1000)))
  const fixedExp = range === 'today' ? weeklyFixed / 7 : range === 'week' ? weeklyFixed : weeklyFixed * weeksInRange

  const totalExpenses = variableExp + payrollPaid + fixedExp
  const netMargin = revenue - totalExpenses

  const panelsSold = containers
    .filter((c) => c.dateLoaded && inRange(c.dateLoaded, start, end))
    .reduce((s, c) => s + (Number(c.panelCount) || 0), 0)
  const containersShipped = containers.filter(
    (c) => c.dateLoaded && inRange(c.dateLoaded, start, end) && ['Loaded', 'In Transit', 'Delivered'].includes(c.status)
  ).length

  // Weekly revenue vs expenses for the last 6 weeks
  const weekly = useMemo(() => buildWeeklySeries(payments, expenses, weeklyFixed), [payments, expenses, weeklyFixed])

  // Top buyers by collected volume
  const topBuyers = useMemo(() => {
    const map = {}
    payments.forEach((p) => {
      const deal = deals.find((d) => d.id === p.dealId)
      const name = deal?.buyer || 'Unknown'
      map[name] = (map[name] || 0) + (Number(p.amount) || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [payments, deals])

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        <div className="card p-4">
          <h2 className="text-lg font-bold text-navy">Business Insights</h2>
          <p className="text-sm text-slate-500">Collections, costs and margin in one place.</p>
          <div className="mt-3">
            <FilterTabs
              tabs={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'custom', label: 'Custom' },
              ]}
              value={range}
              onChange={setRange}
            />
          </div>
          {range === 'custom' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="From"><input type="date" className="input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} /></Field>
              <Field label="To"><input type="date" className="input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} /></Field>
            </div>
          )}
        </div>

        {/* Headline */}
        <section className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-deep to-navy p-5 text-white shadow-card">
          <div className="text-sm text-white/70">Gross revenue collected</div>
          <div className="mt-1 text-4xl font-extrabold tracking-tight">{money(revenue, opts)}</div>
          <div className="mt-1 text-sm text-white/70">in the selected range</div>
          <div className={`mt-4 inline-flex rounded-xl px-3 py-2 text-sm font-bold ${netMargin >= 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
            Net margin: {money(netMargin, opts)}
          </div>
        </section>

        {/* Secondary stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard icon="bolt" tone="gold" label="Panels Sold" value={panelsSold.toLocaleString()} />
          <StatCard icon="container" tone="navy" label="Containers Shipped" value={containersShipped} />
          <StatCard icon="payroll" tone="green" label="Payroll Paid Out" value={money(payrollPaid, opts)} />
          <StatCard icon="expense" tone="red" label="Fixed + Variable Exp." value={money(fixedExp + variableExp, opts)} />
        </div>

        {/* Chart */}
        <section className="mt-4 card p-4">
          <h3 className="font-bold text-navy">Revenue vs Expenses</h3>
          <p className="text-xs text-slate-400">Last 6 weeks · collections (gold) vs spend (navy)</p>
          <BarChart data={weekly} opts={opts} />
        </section>

        {/* Top buyers */}
        <section className="mt-4 card p-4">
          <h3 className="font-bold text-navy">Top Buyers by Volume</h3>
          {topBuyers.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No collections recorded yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {topBuyers.map(([name, amt], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy/10 text-sm font-bold text-navy">{i + 1}</div>
                  <div className="min-w-0 flex-1 truncate font-medium text-navy">{name}</div>
                  <div className="font-bold text-navy">{money(amt, opts)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Page>
    </>
  )
}

/* ------------------------------------------------------------- helpers */
function buildWeeklySeries(payments, expenses, weeklyFixed) {
  const weeks = []
  for (let i = 5; i >= 0; i--) {
    const ref = new Date()
    ref.setDate(ref.getDate() - i * 7)
    const s = startOfWeek(ref)
    const e = endOfWeek(ref)
    const rev = payments.filter((p) => inRange(p.date, s, e)).reduce((a, p) => a + (Number(p.amount) || 0), 0)
    const exp = expenses.filter((x) => inRange(x.date, s, e)).reduce((a, x) => a + (Number(x.amount) || 0), 0) + weeklyFixed
    weeks.push({ label: s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), rev, exp })
  }
  return weeks
}

function BarChart({ data, opts }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.rev, d.exp)))
  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[16px] rounded-t bg-gold"
                style={{ height: `${(d.rev / max) * 100}%` }}
                title={money(d.rev, opts)}
              />
              <div
                className="w-1/2 max-w-[16px] rounded-t bg-navy"
                style={{ height: `${(d.exp / max) * 100}%` }}
                title={money(d.exp, opts)}
              />
            </div>
            <div className="text-[10px] text-slate-400">{d.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Revenue</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-navy" /> Expenses</span>
      </div>
    </div>
  )
}
