'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

export default function DashboardPage() {
  const { dbUser, loading, authenticated, ready } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">

          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back{dbUser?.displayName ? `, ${dbUser.displayName}` : ''}
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Active Listings', value: dbUser?._count?.listings ?? 0, color: 'text-lime-400' },
              { label: 'Total Orders', value: (dbUser?._count?.ordersAsSeller ?? 0) + (dbUser?._count?.ordersAsBuyer ?? 0), color: 'text-white' },
              { label: 'Reviews', value: dbUser?._count?.reviewsReceived ?? 0, color: 'text-violet-400' },
              { label: 'Tier', value: dbUser?.tier ?? 'ANON', color: 'text-sky-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
                <div className="text-xs text-white/25 font-mono mb-2">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {(dbUser?._count?.listings ?? 0) === 0 ? (
            <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-12 text-center">
              <div className="text-3xl mb-4">◈</div>
              <div className="text-white font-semibold mb-2">No listings yet</div>
              <div className="text-sm text-white/35 mb-6">Create your first listing and start getting hired.</div>
              <Link href="/dashboard/listings/new">
                <button className="px-6 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all">
                  Create Listing
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">Quick Actions</div>
              <div className="flex gap-3">
                <Link href="/dashboard/listings/new">
                  <button className="px-5 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all">
                    + New Listing
                  </button>
                </Link>
                <Link href="/dashboard/orders">
                  <button className="px-5 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/20 transition-all">
                    View Orders
                  </button>
                </Link>
              </div>
            </div>
          )}

          {dbUser?.tier === 'ANON' && (
            <div className="mt-4 bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-violet-400 mb-1">Upgrade to Verified</div>
                <div className="text-xs text-white/35">
                  Get a verified badge, higher job limits, and more trust from buyers.
                </div>
              </div>
              <Link href="/verify">
                <button className="px-4 py-2 rounded-lg border border-violet-500/30 text-violet-400 text-xs font-semibold hover:bg-violet-500/10 transition-all shrink-0">
                  Get Verified →
                </button>
              </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
