'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

const links = [
  { label: 'Dashboard', href: '/admin', icon: '◈' },
  { label: 'Users', href: '/admin/users', icon: '◉' },
  { label: 'Messages', href: '/admin/messages', icon: '◎' },
  { label: 'Disputes', href: '/admin/disputes', icon: '⚠' },
  { label: 'Orders', href: '/admin/orders', icon: '⟳' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { dbUser } = useUser()

  return (
    <aside className="w-52 shrink-0 flex flex-col">
      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 mb-4">
        <div className="text-[10px] text-white/25 font-mono tracking-[2px] uppercase mb-3">Admin Panel</div>
        {dbUser && (
          <>
            <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold text-sm mb-2.5">
              {(dbUser.displayName ?? dbUser.username ?? '?')[0].toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {dbUser.displayName ?? dbUser.username ?? 'Admin'}
            </div>
            <div className="text-[10px] font-mono mt-0.5 text-violet-400">
              {dbUser.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
            </div>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-0.5">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-violet-500/10 text-violet-400 font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="font-mono text-xs w-4 text-center">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/20 hover:text-white/40 transition-colors font-mono"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  )
}
