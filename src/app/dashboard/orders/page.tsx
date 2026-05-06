'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

type Tab = 'buying' | 'selling'

interface Order {
  id: string
  status: string
  escrowStatus: string
  amount: number
  currency: string
  createdAt: string
  deliveredAt?: string
  completedAt?: string
  disputedAt?: string
  listing: { id: string; title: string; category: string }
  package: { name: string; price: number; deliveryDays: number }
  buyer: { username?: string; displayName?: string; walletAddress?: string }
  seller: { username?: string; displayName?: string; walletAddress?: string }
}

const statusColor: Record<string, string> = {
  PENDING: 'text-white/40 bg-white/5 border-white/10',
  ACTIVE: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  DELIVERED: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  COMPLETED: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  DISPUTED: 'text-red-400 bg-red-400/10 border-red-400/20',
  CANCELLED: 'text-white/25 bg-white/5 border-white/10',
  REFUNDED: 'text-white/25 bg-white/5 border-white/10',
}

const escrowLabel: Record<string, string> = {
  HOLDING: 'Payment: Secured',
  RELEASED: 'Payment: Released',
  REFUNDED: 'Refunded',
  DISPUTED: 'Under Review',
}

const escrowColor: Record<string, string> = {
  HOLDING: 'text-amber-400',
  RELEASED: 'text-lime-400',
  REFUNDED: 'text-red-400',
  DISPUTED: 'text-red-400',
}

function displayName(u: { username?: string; displayName?: string; walletAddress?: string }) {
  return u.displayName ?? u.username ?? (u.walletAddress ? `${u.walletAddress.slice(0, 6)}...` : 'Unknown')
}

export default function OrdersPage() {
  const { privyUser, authenticated, ready } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('buying')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  useEffect(() => {
    if (!privyUser?.id) return
    fetchOrders()
  }, [privyUser, tab])

  async function fetchOrders() {
    if (!privyUser?.id) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/orders?privyUserId=${privyUser.id}&role=${tab === 'buying' ? 'buyer' : 'seller'}`
      )
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function escrowAction(orderId: string, action: string) {
    if (!privyUser?.id) return
    setActionLoading(orderId + action)
    try {
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, orderId, privyUserId: privyUser.id }),
      })
      if (res.ok) await fetchOrders()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">

          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Orders</h1>
          </div>

          <div className="flex gap-1 mb-6 bg-[#111114] border border-white/[0.07] rounded-xl p-1 w-fit">
            {(['buying', 'selling'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t ? 'bg-white/[0.07] text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {t === 'buying' ? 'As Buyer' : 'As Seller'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-16 text-center">
              <div className="text-3xl mb-4">&#x27F3;</div>
              <div className="text-white font-semibold mb-2">No orders yet</div>
              <div className="text-sm text-white/35">
                {tab === 'buying'
                  ? 'Browse the marketplace and place your first order.'
                  : 'Once buyers order your services they will appear here.'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-sm font-semibold text-white mb-1 truncate">
                        {order.listing.title}
                      </div>
                      <div className="text-xs text-white/30 font-mono">
                        {tab === 'buying'
                          ? `Seller: ${displayName(order.seller)}`
                          : `Buyer: ${displayName(order.buyer)}`}
                        {' · '}
                        {order.package.name} package
                        {' · '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <div className="flex items-center gap-5">
                      <div className="text-base font-bold text-white">
                        ${order.amount}{' '}
                        <span className="text-xs font-normal text-white/25 font-mono">{order.currency}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">&#x1F512;</span>
                        <span className={`text-xs font-mono ${escrowColor[order.escrowStatus]}`}>
                          {escrowLabel[order.escrowStatus] ?? order.escrowStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {tab === 'selling' && order.status === 'PENDING' && (
                        <button
                          onClick={() => escrowAction(order.id, 'activate')}
                          disabled={!!actionLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/20 hover:bg-sky-400/20 transition-all disabled:opacity-40"
                        >
                          Accept Order
                        </button>
                      )}
                      {tab === 'selling' && order.status === 'ACTIVE' && (
                        <button
                          onClick={() => escrowAction(order.id, 'deliver')}
                          disabled={!!actionLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 transition-all disabled:opacity-40"
                        >
                          {actionLoading === order.id + 'deliver' ? 'Marking...' : 'Mark Delivered'}
                        </button>
                      )}
                      {tab === 'buying' && order.status === 'DELIVERED' && (
                        <button
                          onClick={() => escrowAction(order.id, 'confirm')}
                          disabled={!!actionLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all disabled:opacity-40"
                        >
                          {actionLoading === order.id + 'confirm' ? 'Releasing...' : 'Confirm & Release'}
                        </button>
                      )}
                      {['ACTIVE', 'PENDING', 'DELIVERED'].includes(order.status) && (
                        <button
                          onClick={() => escrowAction(order.id, 'dispute')}
                          disabled={!!actionLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                        >
                          Dispute
                        </button>
                      )}
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-start gap-3">
            <span className="text-lg">&#x1F512;</span>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-1">How payments work</div>
              <div className="text-xs text-white/25 leading-relaxed">
                Funds are secured when an order is placed. The seller delivers, you confirm, and payment releases. Disputes are arbitrated by the ShillMarket team within 72 hours.
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
