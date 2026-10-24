import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AiSidebar } from './AiSidebar'
import { Button } from './Button'
import { useAuth } from '../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="4" width="5" height="16" rx="1.2" />
        <rect x="9.5" y="4" width="5" height="10" rx="1.2" />
        <rect x="15.5" y="4" width="5" height="13" rx="1.2" />
      </svg>
    ),
  },
]

const adminItem: NavItem = {
  to: '/users',
  label: 'Users',
  icon: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 19c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5" />
      <path d="M14 19c.4-2 1.7-3.2 3.5-3.2 1.4 0 2.5.8 3 2.2" />
    </svg>
  ),
}

function SidebarNav({
  onNavigate,
  isAdmin,
}: {
  onNavigate: () => void
  isAdmin: boolean
}) {
  const items = isAdmin ? [...navItems, adminItem] : navItems

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              isActive
                ? 'bg-brand/10 text-brand shadow-sm shadow-brand/5'
                : 'text-ink-soft hover:bg-muted hover:text-ink',
            ].join(' ')
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell() {
  const { user, logout, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <div className="glass-panel sticky top-0 z-30 flex items-center justify-between border-b border-black/5 px-4 py-3 lg:hidden">
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)} className="px-3 py-2">
          Menu
        </Button>
        <p className="font-display text-lg font-bold">TaskFlow</p>
        <span className="w-14" />
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="animate-overlay-in fixed inset-0 z-40 bg-[#0f1c24]/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/[0.05] bg-white shadow-drawer transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="relative overflow-hidden px-5 pb-5 pt-7">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10" />
          <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-sea/10" />
          <p className="relative font-display text-xl font-extrabold tracking-tight text-ink">TaskFlow</p>
          <p className="relative mt-1 text-xs text-ink-soft/75">Work management</p>
        </div>

        <SidebarNav isAdmin={isAdmin} onNavigate={() => setOpen(false)} />

        <div className="mt-auto border-t border-black/[0.05] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-muted px-3 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">
              {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs capitalize text-ink-soft/70">{user?.role}</p>
            </div>
          </div>
          <Button type="button" variant="secondary" fullWidth onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <AiSidebar />
    </div>
  )
}
