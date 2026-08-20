/** CSV / JSON export helpers. Triggers a browser download. */

function csvCell(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCSV(rows, columns) {
  const cols = columns || (rows[0] ? Object.keys(rows[0]) : [])
  const header = cols.map(csvCell).join(',')
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')).join('\n')
  return `${header}\n${body}`
}

export function download(filename, content, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCSV(filename, rows, columns) {
  download(filename, toCSV(rows, columns))
}

export function downloadJSON(filename, obj) {
  download(filename, JSON.stringify(obj, null, 2), 'application/json')
}
