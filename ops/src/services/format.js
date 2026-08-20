/** Formatting + small date helpers, locale-aware via settings. */

export function money(value, { locale = 'en-US', currency = 'USD' } = {}) {
  const n = Number(value) || 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(n)
}

export function numberFmt(value, locale = 'en-US') {
  const n = Number(value) || 0
  return new Intl.NumberFormat(locale).format(n)
}

export function formatDate(value, locale = 'en-US') {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value, locale = 'en-US') {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(value) {
  if (!value) return ''
  const d = new Date(value).getTime()
  const diff = Date.now() - d
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.round(day / 7)
  if (wk < 5) return `${wk}w ago`
  return formatDate(value)
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Start of the current ISO week (Monday) at 00:00 local. */
export function startOfWeek(d = new Date()) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // 0 = Monday
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - day)
  return date
}

export function endOfWeek(d = new Date()) {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(e.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}

export function startOfMonth(d = new Date()) {
  const date = new Date(d.getFullYear(), d.getMonth(), 1)
  date.setHours(0, 0, 0, 0)
  return date
}

export function endOfMonth(d = new Date()) {
  const date = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  date.setHours(23, 59, 59, 999)
  return date
}

export function startOfDay(d = new Date()) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

export function inRange(dateValue, start, end) {
  if (!dateValue) return false
  const t = new Date(dateValue).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

/** Week label like "Aug 18 – Aug 24, 2026". */
export function weekLabel(d = new Date()) {
  const s = startOfWeek(d)
  const e = endOfWeek(d)
  const opts = { month: 'short', day: 'numeric' }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', {
    ...opts,
    year: 'numeric',
  })}`
}

/** Monday date (ISO yyyy-mm-dd) that identifies a payroll week. */
export function weekKey(d = new Date()) {
  return startOfWeek(d).toISOString().slice(0, 10)
}
