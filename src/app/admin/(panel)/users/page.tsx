'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

interface AdminUser {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  walletAddress: string | null
  tier: string
  isVerified: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  socialsVerified: boolean
  isBanned: boolean
  createdAt: string
  _count: { listings: number; ordersAsBuyer: number; ordersAsSeller: number }
}

const TIERS = ['ANON', 'VERIFIED', 'ELITE', 'INSTITUTION']

const tierColors: Record<string, string> = {
  ANON: 'text-white/40',
  VERIFIED: 'text-lime-400',
  ELITE: 'text-violet-400',
  INSTITUTION: 'text-sky-400',
}

const tierBadge: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

export default function AdminUsersPage() {
  const { privyUser, dbUser } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchUsers = useCallback(() => {
    if (!privyUser?.id) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), ...(search && { search }) })
    fetch(`/api/admin/users?${params}`, { headers: { 'x-privy-user-id': privyUser.id } })
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? [])
        setTotal(d.total ?? 0)
        setPages(d.pages ?? 1)
      })
      .finally(() => setLoading(false))
  }, [privyUser?.id, page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function patchUser(userId: string, data: Record<string, unknown>) {
    if (!privyUser?.id) return
    setActionId(userId)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
      body: JSON.stringify(data),
    })
    await fetchUsers()
    setActionId(null)
  }

  const isSuperAdmin = dbUser?.isSuperAdmin ?? false

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Admin</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Users <span className="text-lg text-white/25 font-normal">{total}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
            placeholder="Search username, wallet, email..."
            className="w-64 bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/30 transition-colors"
          />
          <button
            onClick={() => { setSearch(searchInput); setPage(1) }}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:text-white hover:bg-white/10 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_90px_16px] gap-0 border-b border-white/[0.07] px-5 py-3">
          {['User', 'Tier', 'Stats', ''].map((h, i) => (
            <div key={i} className="text-[10px] text-white/25 font-mono tracking-[1px] uppercase">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-white/[0.04] animate-pulse">
                <div className="h-4 bg-white/5 rounded w-48" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-white/25 font-mono">No users found</div>
        ) : (
          <div className="flex flex-col">
            {users.map((u) => {
              const isExpanded = expandedId === u.id
              const busy = actionId === u.id
              return (
                <div key={u.id} className="border-b border-white/[0.04] last:border-0">
                  {/* Row */}
                  <div
                    className="grid grid-cols-[1fr_100px_90px_16px] gap-0 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  >
                    {/* User info */}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {u.displayName ?? u.username ?? 'Anonymous'}
                        </span>
                        {u.isSuperAdmin && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-violet-500/10 text-violet-400 border-violet-500/20">SUPER ADMIN</span>
                        )}
                        {u.isAdmin && !u.isSuperAdmin && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">ADMIN</span>
                        )}
                        {u.isVerified && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-lime-400/10 text-lime-400 border-lime-400/20">VERIFIED</span>
                        )}
                        {u.isBanned && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">BANNED</span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/25 font-mono">
                        {u.username && `@${u.username} · `}
                        {u.email ?? (u.walletAddress ? `${u.walletAddress.slice(0, 12)}...` : u.id.slice(0, 12))}
                      </div>
                    </div>

                    {/* Tier */}
                    <div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tierBadge[u.tier] ?? tierBadge.ANON}`}>
                        {u.tier}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-[10px] text-white/25 font-mono space-y-0.5">
                      <div>{u._count.listings}L · {u._count.ordersAsSeller}S · {u._count.ordersAsBuyer}B</div>
                      <div>{new Date(u.createdAt).toLocaleDateString()}</div>
                    </div>

                    {/* Chevron */}
                    <div className={`text-white/20 text-xs font-mono transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</div>
                  </div>

                  {/* Expanded actions panel */}
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-white/[0.015] border-t border-white/[0.04]">
                      <div className="pt-4 flex items-center gap-3 flex-wrap">

                        {/* Change Tier */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30 font-mono">Tier:</span>
                          <select
                            value={u.tier}
                            disabled={u.isSuperAdmin || !!actionId}
                            onChange={(e) => patchUser(u.id, { tier: e.target.value })}
                            className="bg-[#0a0a0b] border border-white/[0.1] rounded px-2 py-1.5 text-xs font-mono text-white outline-none disabled:opacity-40 cursor-pointer"
                          >
                            {TIERS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-px h-5 bg-white/[0.07]" />

                        {/* Toggle Verified */}
                        <button
                          disabled={!!actionId}
                          onClick={() => patchUser(u.id, { isVerified: !u.isVerified })}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all disabled:opacity-40 ${
                            u.isVerified
                              ? 'bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/20'
                              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {busy ? '...' : u.isVerified ? '✓ Verified — Revoke' : 'Mark Verified'}
                        </button>

                        {/* Toggle Socials Verified */}
                        <button
                          disabled={!!actionId}
                          onClick={() => patchUser(u.id, { socialsVerified: !u.socialsVerified })}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all disabled:opacity-40 ${
                            u.socialsVerified
                              ? 'bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/20'
                              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {busy ? '...' : u.socialsVerified ? '✓ Socials — Revoke' : 'Verify Socials'}
                        </button>

                        {/* Toggle Admin — super admin only */}
                        {isSuperAdmin && !u.isSuperAdmin && (
                          <button
                            disabled={!!actionId}
                            onClick={() => patchUser(u.id, { isAdmin: !u.isAdmin })}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all disabled:opacity-40 ${
                              u.isAdmin
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                                : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {busy ? '...' : u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        )}

                        <div className="w-px h-5 bg-white/[0.07]" />

                        {/* Ban / Unban */}
                        {!u.isSuperAdmin && (
                          <button
                            disabled={!!actionId}
                            onClick={() => patchUser(u.id, { isBanned: !u.isBanned })}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all disabled:opacity-40 ${
                              u.isBanned
                                ? 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            {busy ? '...' : u.isBanned ? 'Unban' : 'Ban User'}
                          </button>
                        )}

                        <div className="w-px h-5 bg-white/[0.07]" />

                        {/* View Profile */}
                        {u.username ? (
                          <Link href={`/profile/${u.username}`} target="_blank">
                            <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 font-mono transition-all">
                              View Profile ↗
                            </button>
                          </Link>
                        ) : (
                          <span className="text-[10px] text-white/20 font-mono">No profile (no username)</span>
                        )}

                        {/* View Messages */}
                        <button
                          onClick={() => router.push(`/admin/messages?userId=${u.id}`)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 font-mono transition-all"
                        >
                          View Messages
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/25 font-mono">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="text-xs px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  )
}
