/**
 * db.js — the single data service for the whole app.
 *
 * Everything that reads or writes persistent data goes through here. The rest
 * of the app never touches localStorage directly, so this file is the ONLY
 * thing that has to change when we later swap the storage engine for a real
 * backend (Google Sheets API, Firebase, Postgres, etc.).
 *
 * The public API is intentionally async (returns Promises) so a network-backed
 * implementation is a drop-in replacement — no calling code has to change.
 *
 * Data model: a set of named "collections" (arrays of records) plus a small
 * key/value "settings" blob. Each record has a string `id`.
 */

import { buildSeed } from './seed.js'

const STORAGE_KEY = 'aes-ops-db-v1'

/** Collections we persist. Order here also drives export/backup ordering. */
export const COLLECTIONS = [
  'deals',
  'payments', // partial-payment log entries, linked to a deal
  'fixedExpenses',
  'expenses', // variable / one-off expenses
  'workers',
  'payrollWeeks', // archived weekly payroll snapshots
  'sites',
  'containers',
  'contacts',
  'activity', // recent-activity feed
]

const DEFAULT_SETTINGS = {
  company: {
    name: 'AES Energy Global Trade & Solar LLC',
    shortName: 'AES Energy',
    address: '',
    phone: '',
    email: '',
    website: 'aesenergysolar.com',
    zelle: '',
    bank: '',
  },
  currency: 'USD',
  locale: 'en-US',
  businessStatus: 'Active', // Active | Idle
  expenseCategories: [
    'Trucking/Freight',
    'Fuel',
    'Equipment',
    'Supplies',
    'Repairs',
    'Insurance',
    'Other',
  ],
  containerStatuses: ['Loading', 'Loaded', 'In Transit', 'Delivered'],
  dealStages: ['Lead', 'Quoted', 'Invoiced', 'Loading', 'Shipped', 'Paid in Full'],
}

// ---------------------------------------------------------------------------
// Low-level persistence (the swappable part)
// ---------------------------------------------------------------------------

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error('db: failed to read store', err)
    return null
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (err) {
    console.error('db: failed to write store', err)
  }
}

function emptyStore() {
  const store = { settings: { ...DEFAULT_SETTINGS } }
  for (const name of COLLECTIONS) store[name] = []
  return store
}

/** Ensure the store exists and has every collection; seed it on first run. */
function ensureStore() {
  let store = readStore()
  if (!store) {
    store = buildSeed(emptyStore(), DEFAULT_SETTINGS)
    writeStore(store)
    return store
  }
  // Make sure newer collections/settings exist for older saved data.
  let mutated = false
  if (!store.settings) {
    store.settings = { ...DEFAULT_SETTINGS }
    mutated = true
  } else {
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (store.settings[k] === undefined) {
        store.settings[k] = v
        mutated = true
      }
    }
  }
  for (const name of COLLECTIONS) {
    if (!Array.isArray(store[name])) {
      store[name] = []
      mutated = true
    }
  }
  if (mutated) writeStore(store)
  return store
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)))

// ---------------------------------------------------------------------------
// Public async API
// ---------------------------------------------------------------------------

export const db = {
  /** Return the whole store (deep-cloned so callers can't mutate cache). */
  async getAll() {
    return clone(ensureStore())
  },

  async getCollection(name) {
    const store = ensureStore()
    return clone(store[name] || [])
  },

  async getSettings() {
    const store = ensureStore()
    return clone(store.settings)
  },

  async updateSettings(patch) {
    const store = ensureStore()
    store.settings = { ...store.settings, ...patch }
    writeStore(store)
    return clone(store.settings)
  },

  /** Insert a record (auto-id + createdAt if missing). Returns the record. */
  async insert(name, record) {
    const store = ensureStore()
    const now = new Date().toISOString()
    const row = {
      id: record.id || uid(name.slice(0, 3)),
      createdAt: record.createdAt || now,
      updatedAt: now,
      ...record,
    }
    // keep generated id/createdAt if record didn't provide them
    row.id = record.id || row.id
    store[name] = [row, ...(store[name] || [])]
    writeStore(store)
    return clone(row)
  },

  /** Patch a record by id. Returns the updated record (or null). */
  async update(name, id, patch) {
    const store = ensureStore()
    const list = store[name] || []
    const idx = list.findIndex((r) => r.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }
    writeStore(store)
    return clone(list[idx])
  },

  async remove(name, id) {
    const store = ensureStore()
    store[name] = (store[name] || []).filter((r) => r.id !== id)
    writeStore(store)
    return true
  },

  /** Replace a whole collection (used by bulk edits like fixed expenses). */
  async replaceCollection(name, rows) {
    const store = ensureStore()
    store[name] = clone(rows)
    writeStore(store)
    return clone(store[name])
  },

  /** Overwrite the entire store — used by "restore from backup". */
  async importAll(store) {
    const base = emptyStore()
    const merged = { ...base, ...store }
    merged.settings = { ...DEFAULT_SETTINGS, ...(store.settings || {}) }
    writeStore(merged)
    return clone(merged)
  },

  /** Wipe everything and re-seed (Settings → reset). */
  async resetToSeed() {
    const store = buildSeed(emptyStore(), DEFAULT_SETTINGS)
    writeStore(store)
    return clone(store)
  },
}

export { DEFAULT_SETTINGS }
