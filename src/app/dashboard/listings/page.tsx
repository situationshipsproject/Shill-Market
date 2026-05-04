'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

interface Listing {
  id: string
  title: string
  category: string
  status: string
  isFeatured: boolean
  createdAt: string
  packages: { price: number; currency: string }[]
  _count: { orders: number }
}

export default function MyListingsPage() {
  const { privyUser, authenticated, ready } = useUser()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  useEffect(() => {
    if (!privyUser?.id) return
    const fetchListings = async () => {
      try {
        const res = await fetch(`/api/listings?privyUserId=${privyUser.id}&own=true`)
        const data = await res.json()
        setListings(data.listings ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [privyUser])

  const categoryLabel = (cat: string) =>
    cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const statusColor: Record<string, string> = {
    ACTIVE: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
    PAUSED: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    DRAFT: 'text-white/30 bg-white/5 border-white/10',
    REMOVED: 'text-red-400 bg-red-400/10 border-red-400/20',
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">
                Dashboard
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">My Listings</h1>
            </div>
            <Link href="/dashboard/listings/new">
              <button className="px-5 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all">
                + New Listing
              </button>
            </Link>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 animate-pulse h-24" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-16 text-center">
              <div className="text-3xl mb-4">☰</div>
              <div className="text-white font-semibold mb-2">No listings yet</div>
              <div className="text-sm text-white/35 mb-6">
                Create your first listing to start getting hired.
              </div>
              <Link href="/dashboard/listings/new">
                <button className="px-6 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all">
                  Create Listing
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map((listing) => {
                const minPrice = listing.packages.length
                  ? Math.min(...listing.packages.map((p) => p.price))
                  : 0
                return (
                  <div
                    key={listing.id}
                    className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 flex items-center justify-between hover:border-white/15 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor[listing.status]}`}>
                          {listing.status}
                        </span>
                        <span className="text-[11px] text-white/25 font-mono">
                          {categoryLabel(listing.category)}
                        </span>
                        {listing.isFeatured && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-400/10 text-amber-400 border-amber-400/20">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-white truncate pr-4">
                        {listing.title}
                      </div>
                      <div className="text-xs text-white/25 font-mono mt-1">
                        {listing._count?.orders ?? 0} orders · from ${minPrice} USDC
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/listing/${listing.id}`}>
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                          View
                        </button>
                      </Link>
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
