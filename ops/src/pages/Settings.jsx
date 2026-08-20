import React, { useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { Icon } from '../components/Icons.jsx'
import { Field, Select } from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'
import { db } from '../services/db.js'
import { downloadJSON, downloadCSV } from '../services/exporter.js'
import { todayISO } from '../services/format.js'

export default function Settings({ title, onMenu, Header }) {
  const { store, settings, updateSettings, importAll, resetToSeed } = useData()
  const [company, setCompany] = useState(settings.company || {})
  const [saved, setSaved] = useState(false)

  const setC = (k) => (e) => setCompany((c) => ({ ...c, [k]: e.target.value }))

  const saveCompany = async () => {
    await updateSettings({ company })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const exportJSON = async () => {
    const all = await db.getAll()
    downloadJSON(`aes-ops-backup-${todayISO()}.json`, all)
  }

  const exportAllCSV = async () => {
    const all = await db.getAll()
    // export each non-empty collection as its own CSV bundle isn't trivial in one file;
    // export deals + expenses + payments as the most useful combined set.
    downloadCSV(`aes-deals-${todayISO()}.csv`, all.deals || [])
  }

  const onImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        if (confirm('Restore this backup? It replaces all current data.')) {
          await importAll(data)
          alert('Backup restored.')
        }
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        {/* Company info */}
        <Section title="Company Info">
          <div className="grid grid-cols-1 gap-3">
            <Field label="Company name"><input className="input" value={company.name || ''} onChange={setC('name')} /></Field>
            <Field label="Short name (header)"><input className="input" value={company.shortName || ''} onChange={setC('shortName')} /></Field>
            <Field label="Address"><input className="input" value={company.address || ''} onChange={setC('address')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input className="input" value={company.phone || ''} onChange={setC('phone')} /></Field>
              <Field label="Email"><input className="input" value={company.email || ''} onChange={setC('email')} /></Field>
            </div>
            <Field label="Website"><input className="input" value={company.website || ''} onChange={setC('website')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zelle"><input className="input" value={company.zelle || ''} onChange={setC('zelle')} /></Field>
              <Field label="Bank info"><input className="input" value={company.bank || ''} onChange={setC('bank')} /></Field>
            </div>
            <button className="btn-gold" onClick={saveCompany}>
              {saved ? <><Icon.check size={18} /> Saved</> : 'Save company info'}
            </button>
          </div>
        </Section>

        {/* Currency / locale */}
        <Section title="Currency & Locale">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency">
              <Select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} options={['USD', 'EUR', 'GBP', 'XOF', 'NGN']} />
            </Field>
            <Field label="Locale">
              <Select value={settings.locale} onChange={(e) => updateSettings({ locale: e.target.value })} options={['en-US', 'en-GB', 'fr-FR']} />
            </Field>
          </div>
        </Section>

        {/* Manage categories */}
        <Section title="Expense Categories">
          <ListEditor
            items={settings.expenseCategories || []}
            onChange={(items) => updateSettings({ expenseCategories: items })}
            placeholder="New category"
          />
        </Section>

        <Section title="Container Statuses">
          <ListEditor
            items={settings.containerStatuses || []}
            onChange={(items) => updateSettings({ containerStatuses: items })}
            placeholder="New status"
          />
        </Section>

        <Section title="Deal Pipeline Stages">
          <ListEditor
            items={settings.dealStages || []}
            onChange={(items) => updateSettings({ dealStages: items })}
            placeholder="New stage"
          />
        </Section>

        {/* Data */}
        <Section title="Data & Backup">
          <div className="grid grid-cols-1 gap-2.5">
            <button className="btn-ghost justify-between" onClick={exportJSON}>
              <span>Export full backup (JSON)</span> <Icon.download size={18} />
            </button>
            <button className="btn-ghost justify-between" onClick={exportAllCSV}>
              <span>Export deals (CSV)</span> <Icon.download size={18} />
            </button>
            <label className="btn-ghost cursor-pointer justify-between">
              <span>Restore from backup (JSON)</span>
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
              <Icon.box size={18} />
            </label>
            <button
              className="btn-ghost justify-between !text-rose-600"
              onClick={() => { if (confirm('Reset ALL data to sample seed? This cannot be undone.')) resetToSeed() }}
            >
              <span>Reset to sample data</span> <Icon.trash size={18} />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Data is stored locally on this device. The data layer (db.js) is structured so it can later
            be pointed at Google Sheets, Firebase, or Postgres without changing the screens.
          </p>
        </Section>

        <div className="mt-6 text-center text-xs text-slate-400">
          AES Energy Operations · v0.1 · {Object.keys(store).length ? '' : ''}
          {(store.deals?.length || 0)} deals · {(store.expenses?.length || 0)} expenses
        </div>
      </Page>
    </>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-4 card p-4">
      <h3 className="mb-3 font-bold text-navy">{title}</h3>
      {children}
    </section>
  )
}

function ListEditor({ items, onChange, placeholder }) {
  const [val, setVal] = useState('')
  const add = () => {
    const v = val.trim()
    if (!v || items.includes(v)) return
    onChange([...items, v])
    setVal('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it} className="pill bg-slate-100 text-slate-700">
            {it}
            <button onClick={() => onChange(items.filter((x) => x !== it))} className="ml-1 text-slate-400 hover:text-rose-500">
              <Icon.close size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={placeholder}
        />
        <button className="btn-gold" onClick={add}><Icon.plus size={18} /></button>
      </div>
    </div>
  )
}
