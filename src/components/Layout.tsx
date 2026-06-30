import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Übersicht', end: true },
  { to: '/live', label: 'Live' },
  { to: '/spieler', label: 'Spieler' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">🏓 TT-Turnier</span>
          <nav className="flex gap-4 text-sm font-medium">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive ? 'text-white underline underline-offset-4' : 'text-blue-200 hover:text-white'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
