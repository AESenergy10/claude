import React, { useEffect, useState } from 'react'
import { Header, Drawer, NAV } from './components/Shell.jsx'
import { useData } from './context/DataContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Deals from './pages/Deals.jsx'
import Expenses from './pages/Expenses.jsx'
import Payroll from './pages/Payroll.jsx'
import Containers from './pages/Containers.jsx'
import Contacts from './pages/Contacts.jsx'
import Insights from './pages/Insights.jsx'
import Settings from './pages/Settings.jsx'

const PAGES = {
  dashboard: Dashboard,
  deals: Deals,
  expenses: Expenses,
  payroll: Payroll,
  containers: Containers,
  contacts: Contacts,
  insights: Insights,
  settings: Settings,
}

function currentFromHash() {
  const h = window.location.hash.replace('#/', '').replace('#', '')
  return PAGES[h] ? h : 'dashboard'
}

export default function App() {
  const { ready } = useData()
  const [route, setRoute] = useState(currentFromHash())
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    const onHash = () => setRoute(currentFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (key) => {
    window.location.hash = `/${key}`
    setRoute(key)
    setDrawer(false)
    window.scrollTo({ top: 0 })
  }

  const meta = NAV.find((n) => n.key === route) || NAV[0]
  const PageCmp = PAGES[route] || Dashboard

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-xl bg-gold" />
          <p className="font-semibold">Loading AES Energy…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Drawer open={drawer} onClose={() => setDrawer(false)} current={route} onNavigate={navigate} />
      <PageCmp
        title={meta.label}
        onMenu={() => setDrawer(true)}
        navigate={navigate}
        Header={Header}
      />
    </div>
  )
}
