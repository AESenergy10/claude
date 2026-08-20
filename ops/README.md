# AES Energy — Operations Tracker

A mobile-first internal operations app for **AES Energy Global Trade & Solar LLC**,
a bulk solar-panel export/trading business. Built for the founder to manage deals,
expenses, payroll, containers, and daily business status from her phone.

Navy `#1A2744` + Gold `#F5A800` branding, card-based dashboard UI, works great on
iPhone and doesn't break on desktop.

## Run it locally

```bash
cd ops
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173) on your computer, or on
your phone using your machine's LAN IP. To add it to an iPhone home screen, open the
link in Safari → Share → **Add to Home Screen**.

Build a production bundle:

```bash
npm run build      # outputs to ops/dist
npm run preview    # serve the built bundle
```

## Features

- **Dashboard** — date, Active/Idle status toggle, today snapshot (active deals,
  containers in progress, pending payments, weekly payroll, weekly fixed expenses,
  panels shipped MTD) and a recent-activity feed.
- **Deals** — sales pipeline (Lead → Quoted → Invoiced → Loading → Shipped → Paid in
  Full), color-coded payment badges, filters, search, detail view with a running
  partial-payment log.
- **Expense Tracker** — fixed weekly expenses (auto weekly/monthly totals) plus
  variable one-off expenses with categories, vendor, method, receipt photo, search,
  filters, and CSV export.
- **Worker Payroll** — weekly-wage and piece-rate crews, sites/crews, weekly summary
  (wages + fixed = grand total + per-day cost), mark-paid per worker, archived weekly
  history, CSV export.
- **Containers & Shipments** — container loads with a pallets × panels-per-pallet
  quick-math helper, carriers/forwarders, linked deals, status pipeline.
- **Suppliers & Buyers** — buyer/supplier contacts with tags, a "do not contact"
  suppression flag, and outreach-list filtering.
- **Business Insights** — date-range selector, gross revenue collected, secondary
  stats, net margin, a revenue-vs-expenses bar chart, and top buyers.
- **Settings** — company info, currency/locale, editable categories/statuses/stages,
  and JSON/CSV backup + restore.

## Architecture

- **React 18** (functional components + hooks), **Vite**, **Tailwind CSS**.
- All persistent reads/writes go through a single data service, `src/services/db.js`,
  backed by `localStorage`. The public API is async (returns Promises) so it can be
  swapped for a real backend — Google Sheets API, Firebase, or Postgres — **without
  changing any screen code**. Only `db.js` changes.
- `src/context/DataContext.jsx` loads the store into React state and exposes CRUD
  actions; components never touch storage directly.
- Sample seed data (based on real AES context) loads on first run;
  reset or restore from **Settings → Data & Backup**.

## Project layout

```
ops/
  src/
    services/   db.js (storage), seed.js, selectors.js, format.js, exporter.js
    context/    DataContext.jsx
    components/ Shell.jsx, ui.jsx, Icons.jsx
    pages/      Dashboard, Deals, Expenses, Payroll, Containers, Contacts, Insights, Settings
```
