import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { db, uid } from '../services/db.js'

const DataContext = createContext(null)

/**
 * Holds the whole store in React state and exposes async action methods that
 * write through db.js and then refresh local state. Components read the store
 * synchronously and call actions to mutate — they never touch db directly.
 */
export function DataProvider({ children }) {
  const [store, setStore] = useState(null)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const all = await db.getAll()
    setStore(all)
    return all
  }, [])

  useEffect(() => {
    refresh().then(() => setReady(true))
  }, [refresh])

  // --- generic collection helpers ---
  const insert = useCallback(async (name, record) => {
    const row = await db.insert(name, record)
    await refresh()
    return row
  }, [refresh])

  const update = useCallback(async (name, id, patch) => {
    const row = await db.update(name, id, patch)
    await refresh()
    return row
  }, [refresh])

  const remove = useCallback(async (name, id) => {
    await db.remove(name, id)
    await refresh()
  }, [refresh])

  const replaceCollection = useCallback(async (name, rows) => {
    await db.replaceCollection(name, rows)
    await refresh()
  }, [refresh])

  const updateSettings = useCallback(async (patch) => {
    await db.updateSettings(patch)
    await refresh()
  }, [refresh])

  // --- activity feed helper ---
  const logActivity = useCallback(async (type, text) => {
    await db.insert('activity', { id: uid('act'), type, text, at: new Date().toISOString() })
    // trim to last 50 to keep storage light
    const acts = await db.getCollection('activity')
    if (acts.length > 50) {
      const keep = acts.slice(0, 50)
      await db.replaceCollection('activity', keep)
    }
  }, [])

  const importAll = useCallback(async (data) => {
    await db.importAll(data)
    await refresh()
  }, [refresh])

  const resetToSeed = useCallback(async () => {
    await db.resetToSeed()
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      ready,
      store: store || {},
      settings: (store && store.settings) || {},
      refresh,
      insert,
      update,
      remove,
      replaceCollection,
      updateSettings,
      logActivity,
      importAll,
      resetToSeed,
    }),
    [ready, store, refresh, insert, update, remove, replaceCollection, updateSettings, logActivity, importAll, resetToSeed]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}

/** Convenience: money formatter bound to current settings. */
export function useMoney() {
  const { settings } = useData()
  const opts = { locale: settings.locale || 'en-US', currency: settings.currency || 'USD' }
  return opts
}
