# AESENERGY LLC — Revenue & Expense Dashboard

An interactive accounting dashboard built from AESENERGY LLC's Chase Business
Complete Checking statements. Every transaction is parsed straight from the PDF
statements, auto-categorized, and **validated against the bank's own printed
totals** — the build refuses to run if any section fails to reconcile.

**Live dashboard (private artifact):**
https://claude.ai/code/artifact/9e1b14c2-5320-452e-b361-bc66542b8ad0

Coverage: **Jan–Jul 2026 · 1,483 transactions**, all reconciled to the penny.

## What's in here

| File | What it is |
|------|------------|
| `statements/` | The source Chase PDF statements (`YYYY-MM-Name.pdf`). |
| `parse.py` | Parses the PDFs, categorizes transactions, validates vs. bank totals, writes `data.json` + `embed.json`. |
| `build.py` | Injects `embed.json` into `widget.html` → `dashboard.html`. |
| `widget.html` | The dashboard template (contains a `__DATA__` placeholder). |
| `dashboard.html` | The built, self-contained page that gets published as the artifact. |
| `data.json` | Full parsed + categorized transactions (source of truth). |
| `embed.json` | Compact data embedded into the page. |

## Adding a new monthly statement

1. Save the new PDF into `statements/` as `YYYY-MM-Name.pdf`
   (e.g. `2026-08-August.pdf`).
2. In `parse.py`, add one line to each of these dicts for the new month:
   - `FILES` — month key → filename
   - `MONTH_LABEL` — month key → short label (e.g. `"Aug 2026"`)
   - `CONTROL` — the counts & totals from the statement's **CHECKING SUMMARY**
     box (deposits / atm / electronic / other / fees)
   - `SUMMARY` — the beginning & ending balance
3. Rebuild:
   ```bash
   python3 parse.py     # validates & rewrites data.json / embed.json
   python3 build.py     # rebuilds dashboard.html
   ```
   `parse.py` will **stop with an error** if the parsed numbers don't match the
   bank's printed figures, so a bad parse can't slip through.
4. Republish `dashboard.html` to the **same artifact URL** so the phone
   shortcut and link keep working.

Requires Python 3 with `pdfplumber` (`pip install pdfplumber`).

## The dashboard

- **Summary** — KPIs (money in / out / net / ending balance), money-in-vs-out,
  net cash flow, top revenue & expense categories.
- **Trends** — revenue vs. expense, net cash flow, and account balance over time.
- **Expense Categories** — month-to-month expense matrix + composition.
- **Revenue** — month-to-month revenue-by-source matrix + composition.
- **Real P&L** — a true income statement that excludes non-operating money
  (linked MMA transfers, owner & family draws, owner contributions) to show
  real income, real expenses, and net profit.
- **Transactions** — every line item, filterable & searchable.
- **Month selector** — focus any single month across the whole dashboard.
- **Extract** — copy CSV (transactions / category matrix / monthly summary) or
  print a PDF report.

## Note on privacy

This folder contains real bank-statement data. Keep the repository **private**.
