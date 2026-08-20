import React, { useMemo, useState } from 'react'
import { Page } from '../components/Shell.jsx'
import { Icon } from '../components/Icons.jsx'
import { Badge, EmptyState, Modal, SearchBar, FilterTabs, FAB, Field, Select } from '../components/ui.jsx'
import { useData } from '../context/DataContext.jsx'

const TAGS = ['Active Lead', 'Referral', 'Do Not Contact', 'Preferred', 'New']

const emptyContact = (kind) => ({
  kind,
  name: '',
  company: '',
  phone: '',
  email: '',
  location: '',
  tags: [],
  suppressed: false,
  notes: '',
})

function tagTone(tag) {
  if (tag === 'Do Not Contact') return 'red'
  if (tag === 'Active Lead' || tag === 'Preferred') return 'green'
  if (tag === 'Referral') return 'blue'
  return 'slate'
}

export default function Contacts({ title, onMenu, Header }) {
  const { store, insert, update, remove } = useData()
  const contacts = store.contacts || []

  const [kind, setKind] = useState('buyer')
  const [q, setQ] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [hideSuppressed, setHideSuppressed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return contacts.filter((c) => {
      if (c.kind !== kind) return false
      if (hideSuppressed && c.suppressed) return false
      if (tagFilter !== 'all' && !(c.tags || []).includes(tagFilter)) return false
      if (!term) return true
      return (
        c.name?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term)
      )
    })
  }, [contacts, kind, q, tagFilter, hideSuppressed])

  const save = async (data) => {
    if (data.id) await update('contacts', data.id, data)
    else await insert('contacts', data)
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <>
      <Header title={title} onMenu={onMenu} />
      <Page>
        <FilterTabs
          tabs={[{ value: 'buyer', label: 'Buyers' }, { value: 'supplier', label: 'Suppliers / Recyclers' }]}
          value={kind}
          onChange={setKind}
        />

        <div className="mt-3 space-y-3">
          <SearchBar value={q} onChange={setQ} placeholder="Search name, company, phone…" />
          <div className="flex items-center justify-between gap-2">
            <FilterTabs
              tabs={[{ value: 'all', label: 'All tags' }, ...TAGS.map((t) => ({ value: t, label: t }))]}
              value={tagFilter}
              onChange={setTagFilter}
            />
          </div>
          <label className="flex items-center gap-2 px-1 text-sm text-slate-500">
            <input type="checkbox" checked={hideSuppressed} onChange={(e) => setHideSuppressed(e.target.checked)} />
            Hide "Do Not Contact" (for outreach lists)
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon="contacts"
              title={`No ${kind === 'buyer' ? 'buyers' : 'suppliers'} yet`}
              subtitle="Add a contact to keep buyers and suppliers organized."
              action={
                <button className="btn-gold" onClick={() => { setEditing(emptyContact(kind)); setFormOpen(true) }}>
                  <Icon.plus size={20} /> Add Contact
                </button>
              }
            />
          ) : (
            filtered.map((c) => (
              <div key={c.id} className={`card p-4 ${c.suppressed ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy/10 font-bold text-navy">
                      {(c.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-navy">{c.name || 'Unnamed'}</div>
                      {c.company && <div className="text-sm text-slate-500">{c.company}</div>}
                    </div>
                  </div>
                  <button onClick={() => { setEditing(c); setFormOpen(true) }} className="text-slate-400 hover:text-navy">
                    <Icon.edit size={20} />
                  </button>
                </div>

                {(c.tags?.length > 0 || c.suppressed) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.suppressed && <Badge tone="red">Suppressed</Badge>}
                    {(c.tags || []).map((t) => (
                      <Badge key={t} tone={tagTone(t)}>{t}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-navy">
                      <Icon.phone size={16} /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-navy">
                      <Icon.mail size={16} /> {c.email}
                    </a>
                  )}
                  {c.location && (
                    <div className="flex items-center gap-2">
                      <Icon.pin size={16} /> {c.location}
                    </div>
                  )}
                </div>

                {c.notes && <div className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-500">{c.notes}</div>}
              </div>
            ))
          )}
        </div>
      </Page>

      <FAB onClick={() => { setEditing(emptyContact(kind)); setFormOpen(true) }} label="Add Contact" />

      <ContactForm
        open={formOpen}
        initial={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={save}
        onDelete={editing?.id ? async () => { await remove('contacts', editing.id); setFormOpen(false); setEditing(null) } : null}
      />
    </>
  )
}

function ContactForm({ open, initial, onClose, onSave, onDelete }) {
  const [data, setData] = useState(initial || emptyContact('buyer'))
  React.useEffect(() => setData(initial || emptyContact('buyer')), [initial, open])
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  const toggleTag = (tag) =>
    setData((d) => {
      const tags = d.tags || []
      const has = tags.includes(tag)
      const next = has ? tags.filter((t) => t !== tag) : [...tags, tag]
      return { ...d, tags: next, suppressed: tag === 'Do Not Contact' ? !has : d.suppressed }
    })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? 'Edit Contact' : 'Add Contact'}
      footer={
        <div className="flex gap-3">
          {onDelete && (
            <button className="btn-ghost !text-rose-600" onClick={() => { if (confirm('Delete contact?')) onDelete() }}>
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
          <Field label="Type">
            <Select value={data.kind} onChange={set('kind')} options={[{ value: 'buyer', label: 'Buyer' }, { value: 'supplier', label: 'Supplier / Recycler' }]} />
          </Field>
        </div>
        <Field label="Name"><input className="input" value={data.name} onChange={set('name')} /></Field>
        <Field label="Company"><input className="input" value={data.company} onChange={set('company')} /></Field>
        <Field label="Phone / WhatsApp"><input className="input" value={data.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input className="input" value={data.email} onChange={set('email')} /></Field>
        <div className="col-span-2">
          <Field label="Location"><input className="input" value={data.location} onChange={set('location')} /></Field>
        </div>
        <div className="col-span-2">
          <span className="label">Tags</span>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = (data.tags || []).includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`pill ${on ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={!!data.suppressed} onChange={(e) => setData((d) => ({ ...d, suppressed: e.target.checked }))} />
            Suppress from outreach (do not contact)
          </label>
        </div>
        <div className="col-span-2">
          <Field label="Notes"><textarea className="input min-h-[70px]" value={data.notes} onChange={set('notes')} /></Field>
        </div>
      </div>
    </Modal>
  )
}
