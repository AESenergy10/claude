import React, { useEffect } from 'react'
import { Icon } from './Icons.jsx'
import { useData } from '../context/DataContext.jsx'

export const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'deals', label: 'Deals', icon: 'deals' },
  { key: 'expenses', label: 'Expense Tracker', icon: 'expense' },
  { key: 'payroll', label: 'Worker Payroll', icon: 'payroll' },
  { key: 'containers', label: 'Containers & Shipments', icon: 'container' },
  { key: 'contacts', label: 'Suppliers & Buyers', icon: 'contacts' },
  { key: 'insights', label: 'Business Insights', icon: 'insights' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

/* --------------------------------------------------------------- Header */
export function Header({ title, onMenu, right }) {
  return (
    <header className="safe-top sticky top-0 z-20 bg-navy text-white shadow-sm">
      <div className="flex h-14 items-center gap-3 px-3">
        <button
          onClick={onMenu}
          className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10"
          aria-label="Menu"
        >
          <Icon.menu size={24} />
        </button>
        <h1 className="flex-1 truncate text-center text-lg font-bold">{title}</h1>
        <div className="flex min-w-10 items-center justify-end gap-1">{right}</div>
      </div>
    </header>
  )
}

/* --------------------------------------------------------------- Drawer */
export function Drawer({ open, onClose, current, onNavigate }) {
  const { settings } = useData()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy-deep/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="safe-top bg-navy px-5 pb-6 pt-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy-deep">
                <Icon.bolt size={22} />
              </div>
              <span className="text-lg font-extrabold tracking-tight">AES Energy</span>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
              aria-label="Close menu"
            >
              <Icon.close size={20} />
            </button>
          </div>
          <div className="mt-4">
            <div className="text-base font-bold">{settings.company?.name || 'AES Energy'}</div>
            <div className="text-sm text-white/70">Operations Tracker</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((item) => {
            const IconCmp = Icon[item.icon]
            const active = item.key === current
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex w-full items-center gap-4 px-5 py-3.5 text-left ${
                  active ? 'bg-gold-soft' : 'hover:bg-slate-50'
                }`}
              >
                <span className={active ? 'text-gold' : 'text-slate-500'}>
                  <IconCmp size={22} />
                </span>
                <span className={`text-[15px] font-semibold ${active ? 'text-navy' : 'text-slate-700'}`}>
                  {item.label}
                </span>
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-gold" />}
              </button>
            )
          })}
        </nav>

        <div className="safe-bottom border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
          {settings.company?.website || 'aesenergysolar.com'} · v0.1
        </div>
      </aside>
    </>
  )
}

/* ----------------------------------------------------------------- Page */
export function Page({ children }) {
  return <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-28 pt-4">{children}</main>
}
