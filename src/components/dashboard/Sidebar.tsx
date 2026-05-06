'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'

const links = [
  { label: 'Overview', href: '/dashboard', icon: '◈' },
  { label: 'My Listings', href: '/dashboard/listings', icon: '☰' },
  { label: 'Create Listing', href: '/dashboard/listings/new', icon: '+' },
  { label: 'Orders', href: '/dashboard/orders', icon: '⟳' },
  { label: 'Earnings', href: '/dashboard/earnings', icon: '◎' },
  { label: 'Messages', href: '/dashboard/messages', icon: '◉' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
]

const tierColors: Record<string, string> = {
  ANON: 'text-white/40',
  VERIFIED: 'text-lime-400',
  ELITE: 'text-violet-400',
  INSTITUTION: 'text-sky-400',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { privyUser, dbUser, loading } = useUser()
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    if (!privyUser?.id) return
    const res = await fetch('/api/messages', { headers: { 'x-privy-user-id': privyUser.id } })
    if (!res.ok) return
    const data = await res.json()
    const total = (data.conversations ?? []).reduce((sum: number, c: { unread: number }) => sum + c.unread, 0)
    setUnread(total)
  }, [privyUser?.id])

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 15000)
    return () => clearInterval(id)
  }, [fetchUnread])

  return (
    <aside className="w-56 shrink-0 flex flex-col">

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 mb-4">
        {loading ? (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            <div className="w-24 h-3 rounded bg-white/5 animate-pulse mt-3" />
            <div className="w-16 h-3 rounded bg-white/5 animate-pulse" />
          </div>
        ) : dbUser ? (
          <>
            <div className="w-10 h-10 rounded-full bg-lime-400 overflow-hidden relative flex items-center justify-center text-black font-bold text-sm mb-3">
              {dbUser.avatarUrl ? (
                <Image src={dbUser.avatarUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                (dbUser.displayName ?? dbUser.email ?? dbUser.walletAddress ?? '?')[0].toUpperCase()
              )}
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {dbUser.displayName ?? dbUser.username ?? 'Anon'}
            </div>
            <div className={`text-xs font-mono mt-0.5 ${tierColors[dbUser.tier]}`}>
              {dbUser.tier}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {[
                { label: 'Listings', value: dbUser._count?.listings ?? 0 },
                { label: 'Orders', value: dbUser._count?.ordersAsSeller ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded-lg p-2">
                  <div className="text-xs font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-white/25 font-mono">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-xs text-white/30 font-mono">Not signed in</div>
        )}
      </div>

      <nav className="flex flex-col gap-0.5">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
          const isMessages = link.href === '/dashboard/messages'
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-lime-400/10 text-lime-400 font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="font-mono text-xs w-4 text-center">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {isMessages && unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-lime-400 text-black text-[10px] font-bold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )
        })}
        {dbUser?.isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mt-2 border-t border-white/[0.05] pt-3 ${
              pathname.startsWith('/admin')
                ? 'bg-violet-500/10 text-violet-400 font-medium'
                : 'text-violet-400/40 hover:text-violet-400 hover:bg-violet-500/5'
            }`}
          >
            <span className="font-mono text-xs w-4 text-center">◈</span>
            Admin Panel
          </Link>
        )}
      </nav>

    </aside>
  )
}
