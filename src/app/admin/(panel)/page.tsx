'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'

interface Stats {
  totalUsers: number
  totalListings: number
  totalOrders: number
  disputedOrders: number
  completedOrders: number
  totalRevenue: number
}

interface RecentUser {
  id: string
  username: string | null
  displayName: string | null
  tier: string
  createdAt: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

const tierColors: Record<string, string> = {
  ANON: 'text-white/40',
  VERIFIED: 'text-lime-400',
  ELITE: 'text-violet-400',
  INSTITUTION: 'text-sky-400',
}

export default function AdminDashboard() {
  const { privyUser } = useUser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!privyUser?.id) return
    fetch('/api/admin/stats', { headers: { 'x-privy-user-id': privyUser.id } })
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats)
        setRecentUsers(d.recentUsers ?? [])
      })
      .finally(() => setLoading(false))
  }, [privyUser?.id])

  return (
    <>
      <div className="mb-8">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Admin</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-white' },
              { label: 'Active Listings', value: stats.totalListings, color: 'text-lime-400' },
              { label: 'Total Orders', value: stats.totalOrders, color: 'text-white' },
              { label: 'Disputed', value: stats.disputedOrders, color: 'text-red-400' },
              { label: 'Completed', value: stats.completedOrders, color: 'text-lime-400' },
              { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-violet-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono mb-2">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">Recent Sign-ups</div>
            {recentUsers.length === 0 ? (
              <div className="text-sm text-white/25 font-mono">No users yet</div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40 font-bold">
                        {(u.displayName ?? u.username ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">
                          {u.displayName ?? u.username ?? 'Anonymous'}
                        </div>
                        {u.username && <div className="text-[10px] text-white/25 font-mono">@{u.username}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.isSuperAdmin && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-violet-500/10 text-violet-400 border-violet-500/20">
                          SUPER ADMIN
                        </span>
                      )}
                      {u.isAdmin && !u.isSuperAdmin && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">
                          ADMIN
                        </span>
                      )}
                      <span className={`text-xs font-mono ${tierColors[u.tier] ?? 'text-white/40'}`}>
                        {u.tier}
                      </span>
                      <span className="text-[10px] text-white/20 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-white/25 font-mono">Failed to load stats.</div>
      )}
    </>
  )
}
