/** Pure derivation helpers over the store. No side effects. */
import { inRange, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay } from './format.js'

export function dealPaid(deal, payments) {
  return payments
    .filter((p) => p.dealId === deal.id)
    .reduce((s, p) => s + (Number(p.amount) || 0), 0)
}

export function dealBalance(deal, payments) {
  return Math.max(0, (Number(deal.totalValue) || 0) - dealPaid(deal, payments))
}

/** Derive a payment status from the payment log + total value. */
export function derivePaymentStatus(deal, payments) {
  const total = Number(deal.totalValue) || 0
  const paid = dealPaid(deal, payments)
  if (total > 0 && paid >= total) return 'Paid'
  if (paid > 0) return 'Partial'
  return deal.paymentStatus || 'Pending'
}

export function wageTotal(w) {
  return (Number(w.dailyRate) || 0) * (Number(w.daysWorked) || 0)
}

export function pieceTotal(w) {
  return (Number(w.panels) || 0) * (Number(w.ratePerPanel) || 0)
}

export function workerTotal(w) {
  return w.type === 'piece' ? pieceTotal(w) : wageTotal(w)
}

export function fixedWeeklyTotal(fixedExpenses) {
  return fixedExpenses.reduce((s, f) => s + (Number(f.weeklyTotal) || 0), 0)
}

export function payrollWeekTotal(workers) {
  return workers.reduce((s, w) => s + workerTotal(w), 0)
}

/** Sum variable expenses in a date range. */
export function expensesInRange(expenses, start, end) {
  return expenses
    .filter((e) => inRange(e.date, start, end))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)
}

export function paymentsInRange(payments, start, end) {
  return payments
    .filter((p) => inRange(p.date, start, end))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0)
}

export const ranges = {
  today: () => ({ start: startOfDay(), end: new Date(new Date().setHours(23, 59, 59, 999)) }),
  week: () => ({ start: startOfWeek(), end: endOfWeek() }),
  month: () => ({ start: startOfMonth(), end: endOfMonth() }),
}

/** Panels shipped month-to-date from containers marked Loaded/In Transit/Delivered. */
export function panelsShippedMTD(containers) {
  const s = startOfMonth()
  const e = endOfMonth()
  return containers
    .filter((c) => ['Loaded', 'In Transit', 'Delivered'].includes(c.status))
    .filter((c) => (c.dateLoaded ? inRange(c.dateLoaded, s, e) : false))
    .reduce((sum, c) => sum + (Number(c.panelCount) || 0), 0)
}
