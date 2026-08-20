import React from 'react'
import { Page } from '../components/Shell.jsx'
import { StatCard } from '../components/ui.jsx'
import { Icon } from '../components/Icons.jsx'
import { useData } from '../context/DataContext.jsx'
import { money, formatDate, relativeTime } from '../services/format.js'
import {
  dealBalance,
  fixedWeeklyTotal,
  payrollWeekTotal,
  panelsShippedMTD,
} from '../services/selectors.js'

const ACTIVITY_ICON = {
  payment: 'dollar',
  container: 'container',
  expense: 'expense',
  deal: 'deals',
  worker: 'payroll',
  default: 'clock',
}

export default function Dashboard({ title, onMenu, navigate, Header }) {
  const { store, settings, updateSettings } = useData()
  const opts = { locale: settings.locale, currency: settings.currency }

  const deals = store.deals || []
  const payments = store.payments || []
  const containers = store.containers || []
  const workers = store.workers || []
  const fixed = store.fixedExpenses || []
  const activity = store.activity || []

  const activeDeals = deals.filter((d) => d.stage !== 'Paid in Full').length
  const containersInProgress = containers.filter((c) => c.status !== 'Delivered').length
  const pendingPayments = deals.reduce((s, d) => s + dealBalance(d, payments), 0)
  const weekPayroll = payrollWeekTotal(workers)
  const weekFixed = fixedWeeklyTotal(fixed)
  const panelsMTD = panelsShippedMTD(containers)

  const status = settings.businessStatus || 'Active'
  const toggleStatus = () =>
    updateSettings({ businessStatus: status === 'Active' ? 'Idle' : 'Active' })

  const stats = [
    { icon: 'deals', tone: 'blue', label: 'Active Deals', value: activeDeals },
    { icon: 'container', tone: 'navy', label: 'Containers In Progress', value: containersInProgress },
    { icon: 'dollar', tone: 'gold', label: 'Pending Payments', value: money(pendingPayments, opts) },
    { icon: 'payroll', tone: 'green', label: "This Week's Payroll", value: money(weekPayroll, opts) },
    { icon: 'expense', tone: 'red', label: "This Week's Fixed Expenses", value: money(weekFixed, opts) },
    { icon: 'bolt', tone: 'gold', label: 'Panels Shipped (MTD)', value: panelsMTD.toLocaleString() },
  ]

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        {/* Hero card */}
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy-deep via-navy to-navy-light p-5 text-white shadow-card">
          <div className="text-sm text-white/70">{formatDate(new Date(), settings.locale)}</div>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">
            {settings.company?.shortName || 'AES Energy'}
          </h2>
          <div className="mt-4 flex gap-3">
            <button
              onClick={toggleStatus}
              className="flex-1 rounded-xl bg-white/95 px-4 py-3 text-left active:scale-[.98]"
            >
              <div className="text-xs font-medium text-slate-500">Business status</div>
              <div
                className={`mt-0.5 flex items-center gap-1.5 text-lg font-bold ${
                  status === 'Active' ? 'text-emerald-600' : 'text-gold'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    status === 'Active' ? 'bg-emerald-500' : 'bg-gold'
                  }`}
                />
                {status}
              </div>
            </button>
            <div className="flex-1 rounded-xl bg-white/95 px-4 py-3">
              <div className="text-xs font-medium text-slate-500">Pending to collect</div>
              <div className="mt-0.5 text-lg font-bold text-navy">{money(pendingPayments, opts)}</div>
            </div>
          </div>
          <p className="mt-4 text-[15px] font-semibold">Everything that matters today.</p>
          <p className="text-sm text-white/70">
            Track deals, cash, and crews at a glance — act without delay.
          </p>
        </section>

        {/* Snapshot */}
        <section className="mt-5">
          <h3 className="px-1 text-lg font-bold text-navy">Today Snapshot</h3>
          <p className="px-1 text-sm text-slate-500">A quick look at what is happening now.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-navy">Recent Activity</h3>
            <button onClick={() => navigate('insights')} className="text-sm font-semibold text-gold">
              Insights
            </button>
          </div>
          <div className="card divide-y divide-slate-100">
            {activity.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No activity yet.</div>
            )}
            {activity.slice(0, 5).map((a) => {
              const IconCmp = Icon[ACTIVITY_ICON[a.type] || ACTIVITY_ICON.default]
              return (
                <div key={a.id} className="flex items-center gap-3 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    <IconCmp size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-navy">{a.text}</div>
                    <div className="text-xs text-slate-400">{relativeTime(a.at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </Page>
    </>
  )
}
