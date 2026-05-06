'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PLATFORM_FEE = 0.075

interface Order {
  id: string
  status: string
  amount: number
  currency: string
  createdAt: string
  completedAt?: string
  listing: { title: string }
  buyer: { username?: string; displayName?: string; walletAddress?: string }
}

function uName(u: { username?: string; displayName?: string; walletAddress?: string }) {
  return u.displayName ?? u.username ?? (u.walletAddress ? `${u.walletAddress.slice(0, 6)}...` : 'Unknown')
}

function monthKey(date: string) {
  const d = new Date(date)
  return `${d.toLocaleString('default', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`
}

export default function EarningsPage() {
  const { privyUser, authenticated, ready } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  useEffect(() => {
    if (!privyUser?.id) return
    fetch(`/api/orders?privyUserId=${privyUser.id}&role=seller`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false))
  }, [privyUser])

  const completed = orders.filter((o) => o.status === 'COMPLETED')
  const pending = orders.filter((o) => ['ACTIVE', 'DELIVERED'].includes(o.status))
  const totalEarned = completed.reduce((s, o) => s + o.amount, 0)
  const totalPending = pending.reduce((s, o) => s + o.amount, 0)
  const totalFees = totalEarned * PLATFORM_FEE
  const netEarned = totalEarned - totalFees

  const monthMap: Record<string, number> = {}
  completed.forEach((o) => {
    const k = monthKey(o.completedAt ?? o.createdAt)
    monthMap[k] = (monthMap[k] ?? 0) + o.amount
  })
  const chartData = Object.entries(monthMap).slice(-6).map(([month, amount]) => ({ month, amount }))

  const stats = [
    { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, sub: 'gross, all time', color: 'text-lime-400' },
    { label: 'In Escrow', value: `$${totalPending.toFixed(2)}`, sub: 'active + delivered jobs', color: 'text-amber-400' },
    { label: 'Platform Fees', value: `$${totalFees.toFixed(2)}`, sub: '7.5% of gross', color: 'text-white/40' },
    { label: 'Net Earned', value: `$${netEarned.toFixed(2)}`, sub: 'after fees', color: 'text-white' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Earnings</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 h-24 animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3 mb-8">
                {stats.map((s) => (
                  <div key={s.label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                    <div className="text-[10px] text-white/25 font-mono tracking-[1px] uppercase mb-2">{s.label}</div>
                    <div className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-white/20 font-mono mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              {chartData.length > 0 && (
                <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 mb-6">
                  <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Monthly Earnings</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} barCategoryGap="30%">
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 10 }}
                        formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Earned']}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i === chartData.length - 1 ? '#a3e635' : 'rgba(163,230,53,0.4)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.07]">
                  <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase">Completed Orders ({completed.length})</div>
                </div>
                {completed.length === 0 ? (
                  <div className="p-12 text-center text-sm text-white/25 font-mono">No completed orders yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        {['Date', 'Buyer', 'Listing', 'Gross', 'Fee', 'Net'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] text-white/25 font-mono tracking-[1px] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {completed.map((order) => {
                        const fee = order.amount * PLATFORM_FEE
                        return (
                          <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-5 py-3 text-xs text-white/40 font-mono">{new Date(order.completedAt ?? order.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-3 text-xs text-white/60">{uName(order.buyer)}</td>
                            <td className="px-5 py-3 text-xs text-white/60 max-w-[180px] truncate">{order.listing.title}</td>
                            <td className="px-5 py-3 text-xs text-white font-mono">${order.amount.toFixed(2)}</td>
                            <td className="px-5 py-3 text-xs text-red-400/60 font-mono">-${fee.toFixed(2)}</td>
                            <td className="px-5 py-3 text-xs text-lime-400 font-mono font-semibold">${(order.amount - fee).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
