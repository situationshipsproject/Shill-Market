'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

type Tab = 'buying' | 'selling'

const mockOrders = {
  buying: [
    {
      id: 'ord-1',
      title: 'Twitter spaces host + X thread campaign',
      seller: 'DegenGhost',
      amount: 180,
      currency: 'USDC',
      status: 'ACTIVE',
      escrowStatus: 'HOLDING',
      createdAt: '2 days ago',
      deliveryDays: 3,
    },
    {
      id: 'ord-2',
      title: 'Memecoin brand kit — PFP, banner, memes pack',
      seller: 'AlphaXDesign',
      amount: 95,
      currency: 'USDC',
      status: 'COMPLETED',
      escrowStatus: 'RELEASED',
      createdAt: '2 weeks ago',
      deliveryDays: 5,
    },
  ],
  selling: [
    {
      id: 'ord-3',
      title: 'Full Solana smart contract audit + deploy',
      seller: 'You',
      buyer: 'RektKing',
      amount: 450,
      currency: 'USDC',
      status: 'DELIVERED',
      escrowStatus: 'HOLDING',
      createdAt: '1 day ago',
      deliveryDays: 7,
    },
  ],
}

const statusColor: Record<string, string> = {
  PENDING: 'text-white/40 bg-white/5 border-white/10',
  ACTIVE: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  DELIVERED: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  COMPLETED: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  DISPUTED: 'text-red-400 bg-red-400/10 border-red-400/20',
  CANCELLED: 'text-white/25 bg-white/5 border-white/10',
}

const escrowColor: Record<string, string> = {
  HOLDING: 'text-amber-400',
  RELEASED: 'text-lime-400',
  REFUNDED: 'text-red-400',
  DISPUTED: 'text-red-400',
}

export default function OrdersPage() {
  const { authenticated, ready } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('buying')

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  const orders = mockOrders[tab]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">

          {/* HEADER */}
          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">
              Dashboard
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
          </div>

          {/* TABS */}
          <div className="flex gap-1 mb-6 bg-[#111114] border border-white/[0.07] rounded-xl p-1 w-fit">
            {(['buying', 'selling'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {t === 'buying' ? `Buying (${mockOrders.buying.length})` : `Selling (${mockOrders.selling.length})`}
              </button>
            ))}
          </div>

          {/* ORDERS */}
          {orders.length === 0 ? (
            <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-16 text-center">
              <div className="text-3xl mb-4">⟳</div>
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
                        {order.title}
                      </div>
                      <div className="text-xs text-white/30 font-mono">
                        {tab === 'buying' ? `Seller: ${order.seller}` : `Buyer: ${(order as any).buyer}`}
                        {' · '}
                        {order.createdAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-base font-bold text-white">
                          ${order.amount}{' '}
                          <span className="text-xs font-normal text-white/25 font-mono">
                            {order.currency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="text-xs font-mono">🔒</div>
                        <span className={`text-xs font-mono ${escrowColor[order.escrowStatus]}`}>
                          Escrow: {order.escrowStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'DELIVERED' && tab === 'buying' && (
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all">
                          Confirm & Release
                        </button>
                      )}
                      {order.status === 'ACTIVE' && tab === 'selling' && (
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all">
                          Mark Delivered
                        </button>
                      )}
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ESCROW INFO */}
          <div className="mt-6 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-1">How escrow works</div>
              <div className="text-xs text-white/25 leading-relaxed">
                Funds are held securely when an order is placed. The seller delivers the work, then you confirm and funds are released. If there&apos;s a dispute, the ShillMarket team steps in to arbitrate within 72 hours.
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
