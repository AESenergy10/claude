import React from 'react'
import { Icon } from './Icons.jsx'

/* ------------------------------------------------------------------ Badge */
/**
 * Pill-shaped status badge with a consistent color language across the app:
 *  gold  = pending / attention
 *  blue  = in progress
 *  green = complete / paid
 *  red   = overdue / issue
 *  slate = neutral
 */
const TONES = {
  gold: 'bg-gold-soft text-[#946200]',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
  navy: 'bg-navy/10 text-navy',
}

export function Badge({ tone = 'slate', children, className = '' }) {
  return <span className={`pill ${TONES[tone] || TONES.slate} ${className}`}>{children}</span>
}

/** Map a payment status to a badge tone. */
export function paymentTone(status) {
  switch (status) {
    case 'Paid':
      return 'green'
    case 'Partial':
      return 'blue'
    case 'Overdue':
      return 'red'
    case 'Pending':
    default:
      return 'gold'
  }
}

/** Map a deal pipeline stage to a badge tone. */
export function stageTone(stage) {
  switch (stage) {
    case 'Lead':
      return 'slate'
    case 'Quoted':
      return 'gold'
    case 'Invoiced':
      return 'blue'
    case 'Loading':
      return 'blue'
    case 'Shipped':
      return 'navy'
    case 'Paid in Full':
      return 'green'
    default:
      return 'slate'
  }
}

export function containerTone(status) {
  switch (status) {
    case 'Loading':
      return 'gold'
    case 'Loaded':
      return 'blue'
    case 'In Transit':
      return 'navy'
    case 'Delivered':
      return 'green'
    default:
      return 'slate'
  }
}

/* ------------------------------------------------------------- EmptyState */
export function EmptyState({ icon = 'box', title, subtitle, action }) {
  const IconCmp = Icon[icon] || Icon.box
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-soft text-gold">
        <IconCmp size={28} />
      </div>
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-slate-500">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- Modal */
export function Modal({ open, onClose, title, children, footer, wide = false }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className={`safe-bottom flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-3xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <Icon.close size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="safe-bottom border-t border-slate-100 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- SearchBar */
export function SearchBar({ value, onChange, placeholder = 'Search…', onFilterClick, filterActive }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon.search size={20} />
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-[15px] outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
            filterActive
              ? 'border-gold bg-gold-soft text-gold'
              : 'border-slate-200 bg-white text-slate-500'
          }`}
          aria-label="Filters"
        >
          <Icon.filter size={20} />
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- FilterTabs */
export function FilterTabs({ tabs, value, onChange }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.value
        const label = typeof t === 'string' ? t : t.label
        const active = key === value
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-navy text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------- FAB */
export function FAB({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      className="safe-bottom fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl bg-gold px-5 py-3.5 font-bold text-navy-deep shadow-lg shadow-gold/30 active:scale-95"
    >
      <Icon.plus size={22} />
      <span>{label}</span>
    </button>
  )
}

/* --------------------------------------------------------------- StatCard */
export function StatCard({ icon = 'box', tone = 'blue', label, value, sub }) {
  const IconCmp = Icon[icon] || Icon.box
  const iconTones = {
    blue: 'bg-blue-50 text-blue-600',
    gold: 'bg-gold-soft text-gold',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
    navy: 'bg-navy/10 text-navy',
    slate: 'bg-slate-100 text-slate-500',
  }
  return (
    <div className="card p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconTones[tone]}`}>
        <IconCmp size={20} />
      </div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-navy">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

/* ------------------------------------------------------------- Field bits */
export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <select value={value} onChange={onChange} className="input appearance-none" {...rest}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const l = typeof o === 'string' ? o : o.label
        return (
          <option key={v} value={v}>
            {l}
          </option>
        )
      })}
    </select>
  )
}
