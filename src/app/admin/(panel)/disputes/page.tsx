'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'

interface Order {
  id: string
  status: string
  escrowStatus: string
  amount: number
  currency: string
  disputedAt?: string
  createdAt: string
  listing: { title: string; category: string }
  package: { name: string }
  buyer: { username?: string; displayName?: string; walletAddress?: string }
  seller: { username?: string; displayName?: string; walletAddress?: string }
}

type Filter = 'DISPUTED' | 'ALL'

function userLabel(u: { username?: string; displayName?: string; walletAddress?: string }) {
  return u.displayName ?? u.username ?? (u.walletAddress ? u.walletAddress.slice(0, 8) + '...' : 'Unknown')
}

export default function AdminDisputesPage() {
  const { privyUser } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('DISPUTED')

  const fetchAll = useCallback(async () => {
    if (!privyUser?.id) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', { headers: { 'x-privy-user-id': privyUser.id } })
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [privyUser?.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function adminAction(orderId: string, action: 'admin_release' | 'admin_refund') {
    if (!privyUser?.id) return
    setActionLoading(orderId + action)
    try {
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, orderId, privyUserId: privyUser.id }),
      })
      if (res.ok) await fetchAll()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'DISPUTED' ? orders.filter((o) => o.status === 'DISPUTED') : orders

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Admin</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Escrow and Disputes</h1>
        </div>
        <div className="flex gap-2">
          {(['DISPUTED', 'ALL'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-4 py-2 rounded-lg border transition-all ${filter === f ? 'bg-white/[0.07] text-white border-white/20' : 'border-white/10 text-white/40 hover:text-white'}`}>
              {f === 'DISPUTED' ? 'Disputes' : 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, color: 'text-white' },
          { label: 'Active', value: orders.filter((o) => o.status === 'ACTIVE').length, color: 'text-sky-400' },
          { label: 'Disputed', value: orders.filter((o) => o.status === 'DISPUTED').length, color: 'text-red-400' },
          { label: 'Completed', value: orders.filter((o) => o.status === 'COMPLETED').length, color: 'text-lime-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
            <div className="text-xs text-white/25 font-mono mb-2">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 h-32 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-16 text-center">
          <div className="text-white font-semibold">{filter === 'DISPUTED' ? 'No active disputes' : 'No orders yet'}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <div key={order.id} className={`bg-[#111114] border rounded-xl p-5 transition-all ${order.status === 'DISPUTED' ? 'border-red-500/30' : 'border-white/[0.07]'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-white mb-1">{order.listing.title}</div>
                  <div className="text-xs text-white/30 font-mono">Order #{order.id.slice(-8).toUpperCase()} - {new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${order.status === 'DISPUTED' ? 'bg-red-400/10 text-red-400 border-red-400/20' : order.status === 'COMPLETED' ? 'bg-lime-400/10 text-lime-400 border-lime-400/20' : 'bg-white/5 text-white/40 border-white/10'}`}>{order.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[10px] text-white/25 font-mono mb-1">BUYER</div>
                  <div className="text-sm text-white font-medium">{userLabel(order.buyer)}</div>
                  {order.buyer.walletAddress && <div className="text-[10px] text-white/25 font-mono truncate">{order.buyer.walletAddress}</div>}
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[10px] text-white/25 font-mono mb-1">SELLER</div>
                  <div className="text-sm text-white font-medium">{userLabel(order.seller)}</div>
                  {order.seller.walletAddress && <div className="text-[10px] text-white/25 font-mono truncate">{order.seller.walletAddress}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                <div>
                  <div className="text-base font-bold text-white">${order.amount} <span className="text-xs font-normal text-white/25 font-mono">{order.currency}</span></div>
                  <div className="text-[10px] text-white/25 font-mono mt-0.5">Escrow: {order.escrowStatus}</div>
                </div>
                {order.status === 'DISPUTED' && (
                  <div className="flex gap-2">
                    <button onClick={() => adminAction(order.id, 'admin_release')} disabled={!!actionLoading}
                      className="text-xs px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all disabled:opacity-40">
                      {actionLoading === order.id + 'admin_release' ? 'Releasing...' : 'Release to Seller'}
                    </button>
                    <button onClick={() => adminAction(order.id, 'admin_refund')} disabled={!!actionLoading}
                      className="text-xs px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-40">
                      {actionLoading === order.id + 'admin_refund' ? 'Refunding...' : 'Refund Buyer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
