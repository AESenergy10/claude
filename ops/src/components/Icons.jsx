/** Lightweight inline SVG icon set (stroke-based, currentColor). */
import React from 'react'

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ children, size = 22, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...rest}>
      {children}
    </svg>
  )
}

export const Icon = {
  menu: (p) => (
    <Svg {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  ),
  close: (p) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
  dashboard: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </Svg>
  ),
  deals: (p) => (
    <Svg {...p}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v6l9 4 9-4V7" />
      <path d="M12 11v10" />
    </Svg>
  ),
  expense: (p) => (
    <Svg {...p}>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M9 13h6M9 17h6M9 9h2" />
    </Svg>
  ),
  payroll: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <path d="M16 11h5M18.5 8.5v5" />
    </Svg>
  ),
  container: (p) => (
    <Svg {...p}>
      <rect x="2" y="7" width="20" height="10" rx="1" />
      <path d="M6 7v10M10 7v10M14 7v10M18 7v10" />
    </Svg>
  ),
  contacts: (p) => (
    <Svg {...p}>
      <circle cx="8" cy="8" r="3" />
      <path d="M2 20c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15 20c0-2.4 2-4 4.5-3.6" />
    </Svg>
  ),
  insights: (p) => (
    <Svg {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </Svg>
  ),
  settings: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.5a7 7 0 0 0-2.2 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1c.7.6 1.4 1 2.2 1.3L10 21h4l.4-2.5c.8-.3 1.5-.7 2.2-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z" />
    </Svg>
  ),
  plus: (p) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  search: (p) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </Svg>
  ),
  filter: (p) => (
    <Svg {...p}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </Svg>
  ),
  download: (p) => (
    <Svg {...p}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 21h16" />
    </Svg>
  ),
  phone: (p) => (
    <Svg {...p}>
      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  mail: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Svg>
  ),
  pin: (p) => (
    <Svg {...p}>
      <path d="M12 21s7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  ),
  chevron: (p) => (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  edit: (p) => (
    <Svg {...p}>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 6.5l3 3" />
    </Svg>
  ),
  trash: (p) => (
    <Svg {...p}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </Svg>
  ),
  logout: (p) => (
    <Svg {...p}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  ),
  dollar: (p) => (
    <Svg {...p}>
      <path d="M12 3v18M16 7c0-2-2-3-4-3s-4 1-4 3 2 3 4 3 4 1 4 3-2 3-4 3-4-1-4-3" />
    </Svg>
  ),
  clock: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  bolt: (p) => (
    <Svg {...p}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </Svg>
  ),
  swap: (p) => (
    <Svg {...p}>
      <path d="M7 7h11l-3-3M17 17H6l3 3" />
    </Svg>
  ),
  check: (p) => (
    <Svg {...p}>
      <path d="M5 13l4 4L19 7" />
    </Svg>
  ),
  box: (p) => (
    <Svg {...p}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </Svg>
  ),
}
