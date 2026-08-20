/**
 * seed.js — sample records so the app isn't empty on first run.
 * Based on real AES Energy operational context provided by the founder.
 */

import { weekKey } from './format.js'

let counter = 0
function sid(prefix) {
  counter += 1
  return `${prefix}_seed${counter}`
}

function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function buildSeed(store, settings) {
  const nowWeek = weekKey()

  // ---- Contacts (suppliers + buyers) ----
  const buyerFab = sid('con')
  const buyerNoor = sid('con')
  store.contacts = [
    {
      id: buyerFab,
      kind: 'buyer',
      name: 'Amadou Diallo',
      company: 'FabTech Solar Solutions',
      phone: '+223 70 00 11 22',
      email: 'purchasing@fabtechsolar.com',
      location: 'Bamako, Mali',
      tags: ['Active Lead'],
      suppressed: false,
      notes: 'Wants Boviet 545W/540W lots. Ready to move ~2,000 pallets.',
      createdAt: daysAgoISO(20),
    },
    {
      id: buyerNoor,
      kind: 'buyer',
      name: 'Ibrahim Noor',
      company: 'Noor Trading & Shipping Corp',
      phone: '+220 300 4455',
      email: 'ops@noortrading.com',
      location: 'Banjul, Gambia',
      tags: ['Referral'],
      suppressed: false,
      notes: 'Invoice AES-2026-0727-NF. 2 containers used panels @ $9/panel.',
      createdAt: daysAgoISO(14),
    },
    {
      id: sid('con'),
      kind: 'supplier',
      name: 'Green Recycle Partners',
      company: 'Green Recycle Partners LLC',
      phone: '+1 602 555 0110',
      email: 'sales@greenrecycle.example',
      location: 'Phoenix, AZ',
      tags: ['Referral'],
      suppressed: false,
      notes: 'Reliable source for decommissioned utility panels.',
      createdAt: daysAgoISO(30),
    },
    {
      id: sid('con'),
      kind: 'supplier',
      name: 'East Coast Solar Salvage',
      company: 'East Coast Solar Salvage',
      phone: '+1 704 555 0175',
      email: '',
      location: 'Charlotte, NC',
      tags: ['Do Not Contact'],
      suppressed: true,
      notes: 'Unresponsive on last 3 outreach attempts — suppressed.',
      createdAt: daysAgoISO(45),
    },
  ]

  // ---- Deals ----
  const dealFab = sid('deal')
  const dealNoor = sid('deal')
  store.deals = [
    {
      id: dealFab,
      buyer: 'FabTech Solar Solutions',
      contactPerson: 'Amadou Diallo',
      contactId: buyerFab,
      panelBrand: 'Boviet Solar',
      wattage: 545,
      quantityPanels: 0,
      quantityPallets: 2000,
      containers: 0,
      pricePerPanel: 0,
      totalValue: 0,
      paymentStatus: 'Partial',
      invoiceNumber: '',
      incoterm: 'FOB Origin',
      destination: 'Mali (West Africa)',
      stage: 'Invoiced',
      notes: 'Boviet 545W/540W lot, ~2,000 pallets ready. Invoiced partial ~1,000 pallets. Flash-tested; standard warranty.',
      createdAt: daysAgoISO(12),
    },
    {
      id: dealNoor,
      buyer: 'Noor Trading & Shipping Corp',
      contactPerson: 'Ibrahim Noor',
      contactId: buyerNoor,
      panelBrand: 'Mixed Used',
      wattage: 0,
      quantityPanels: 2000,
      quantityPallets: 0,
      containers: 2,
      pricePerPanel: 9,
      totalValue: 18000,
      paymentStatus: 'Partial',
      invoiceNumber: 'AES-2026-0727-NF',
      incoterm: 'FOB Origin',
      destination: 'Gambia (West Africa)',
      stage: 'Loading',
      notes: '2,000 used panels, 2 containers @ $9/panel. Loading in progress.',
      createdAt: daysAgoISO(9),
    },
  ]

  // ---- Payments (partial-payment log) ----
  store.payments = [
    {
      id: sid('pay'),
      dealId: dealNoor,
      amount: 6000,
      date: daysAgoISO(5).slice(0, 10),
      method: 'Zelle',
      note: 'Deposit on 2-container order',
      createdAt: daysAgoISO(5),
    },
  ]

  // ---- Fixed weekly expenses ----
  store.fixedExpenses = [
    { id: sid('fx'), name: 'Rent', dailyRate: 0, daysPerWeek: 0, weeklyTotal: 720 },
    { id: sid('fx'), name: 'Car', dailyRate: 0, daysPerWeek: 0, weeklyTotal: 360 },
    { id: sid('fx'), name: 'Water + Ice', dailyRate: 0, daysPerWeek: 0, weeklyTotal: 210 },
  ]

  // ---- Variable expenses ----
  store.expenses = [
    {
      id: sid('exp'),
      title: 'Container drayage — Phoenix yard',
      category: 'Trucking/Freight',
      vendor: 'Desert Haul LLC',
      amount: 850,
      date: daysAgoISO(3).slice(0, 10),
      method: 'ACH',
      note: 'Move loaded container to port ramp',
      receipt: '',
      createdAt: daysAgoISO(3),
    },
    {
      id: sid('exp'),
      title: 'Forklift diesel',
      category: 'Fuel',
      vendor: 'QuikStop',
      amount: 140,
      date: daysAgoISO(2).slice(0, 10),
      method: 'Cash',
      note: '',
      receipt: '',
      createdAt: daysAgoISO(2),
    },
  ]

  // ---- Sites ----
  const sitePhoenix = sid('site')
  const siteVa = sid('site')
  store.sites = [
    { id: sitePhoenix, name: 'Phoenix site', location: 'Phoenix, AZ', createdAt: daysAgoISO(30) },
    { id: siteVa, name: 'Virginia decommissioning site', location: 'Virginia', createdAt: daysAgoISO(25) },
  ]

  // ---- Workers (weekly wage crew) ----
  store.workers = [
    { id: sid('wrk'), name: 'Ahassane', type: 'wage', dailyRate: 160, daysWorked: 5, siteId: sitePhoenix, paid: false, method: '', panels: 0, ratePerPanel: 0, weekKey: nowWeek, createdAt: daysAgoISO(6) },
    { id: sid('wrk'), name: 'Laye', type: 'wage', dailyRate: 160, daysWorked: 5, siteId: sitePhoenix, paid: false, method: '', panels: 0, ratePerPanel: 0, weekKey: nowWeek, createdAt: daysAgoISO(6) },
    { id: sid('wrk'), name: 'Aladji', type: 'wage', dailyRate: 160, daysWorked: 4, siteId: sitePhoenix, paid: false, method: '', panels: 0, ratePerPanel: 0, weekKey: nowWeek, createdAt: daysAgoISO(6) },
    { id: sid('wrk'), name: 'ABlaye', type: 'wage', dailyRate: 185, daysWorked: 5, siteId: siteVa, paid: false, method: '', panels: 0, ratePerPanel: 0, weekKey: nowWeek, createdAt: daysAgoISO(6) },
    { id: sid('wrk'), name: 'Dokota', type: 'wage', dailyRate: 133, daysWorked: 5, siteId: siteVa, paid: false, method: '', panels: 0, ratePerPanel: 0, weekKey: nowWeek, createdAt: daysAgoISO(6) },
  ]

  store.payrollWeeks = []

  // ---- Containers ----
  store.containers = [
    {
      id: sid('cnt'),
      containerNumber: 'MSKU-772041-3',
      site: 'Phoenix',
      panelBrand: 'Boviet Solar 545W',
      pallets: 19,
      panelsPerPallet: 44,
      panelCount: 836,
      dateLoaded: daysAgoISO(4).slice(0, 10),
      carrier: 'Desert Haul LLC',
      forwarder: 'TransAtlantic Freight',
      dealId: dealNoor,
      buyer: 'Noor Trading & Shipping Corp',
      status: 'Loaded',
      createdAt: daysAgoISO(4),
    },
    {
      id: sid('cnt'),
      containerNumber: 'TCLU-559820-1',
      site: 'Virginia',
      panelBrand: 'Mixed Used 540W',
      pallets: 19,
      panelsPerPallet: 48,
      panelCount: 912,
      dateLoaded: '',
      carrier: '',
      forwarder: '',
      dealId: dealNoor,
      buyer: 'Noor Trading & Shipping Corp',
      status: 'Loading',
      createdAt: daysAgoISO(2),
    },
  ]

  // ---- Activity feed ----
  store.activity = [
    { id: sid('act'), type: 'payment', text: 'Payment received — $6,000 from Noor Trading', at: daysAgoISO(5) },
    { id: sid('act'), type: 'container', text: 'Container MSKU-772041-3 loaded at Phoenix', at: daysAgoISO(4) },
    { id: sid('act'), type: 'expense', text: 'Expense logged — Container drayage $850', at: daysAgoISO(3) },
    { id: sid('act'), type: 'deal', text: 'Deal invoiced — FabTech Solar Solutions', at: daysAgoISO(2) },
    { id: sid('act'), type: 'deal', text: 'Deal moved to Loading — Noor Trading', at: daysAgoISO(1) },
  ]

  return store
}
