'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'

interface Package {
  price: number
  deliveryDays: number
}

interface Listing {
  id: string
  title: string
  category: string
  packages: Package[]
  _count: { orders: number }
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { username: string | null; displayName: string | null; avatarUrl: string | null; tier: string }
  order: { listing: { title: string } }
}

interface Profile {
  id: string
  username: string | null
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  tier: string
  isVerified: boolean
  createdAt: string
  listings: Listing[]
  reviewsReceived: Review[]
  _count: { listings: number; ordersAsSeller: number; reviewsReceived: number }
}

const tierStyles: Record<string, { badge: string; label: string }> = {
  ANON: { badge: 'bg-white/5 text-white/40 border-white/10', label: 'Anon' },
  VERIFIED: { badge: 'bg-lime-400/10 text-lime-400 border-lime-400/20', label: 'Verified' },
  ELITE: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'Elite' },
  INSTITUTION: { badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', label: 'Institution' },
}

type Tab = 'listings' | 'reviews'

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('listings')

  useEffect(() => {
    if (!username) return
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user)
          setAvgRating(data.avgRating)
        }
      })
      .finally(() => setLoading(false))
  }, [username])

  const categoryLabel = (cat: string) =>
    cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const minPrice = (listing: Listing) =>
    listing.packages.length ? Math.min(...listing.packages.map((p) => p.price)) : 0

  const minDelivery = (listing: Listing) =>
    listing.packages.length ? Math.min(...listing.packages.map((p) => p.deliveryDays)) : 0

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-semibold mb-2">User not found</div>
          <Link href="/marketplace" className="text-xs text-lime-400 font-mono">← Back to marketplace</Link>
        </div>
      </div>
    )
  }

  const tier = tierStyles[profile.tier] ?? tierStyles.ANON
  const initials = (profile.displayName ?? profile.username ?? '?').slice(0, 2).toUpperCase()
  const memberYear = new Date(profile.createdAt).getFullYear()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      <div className="h-32 bg-gradient-to-r from-[#111114] via-[#18181c] to-[#111114] border-b border-white/[0.05]" />

      <div className="max-w-5xl mx-auto px-8 pb-24">

        <div className="flex items-end justify-between -mt-10 mb-8">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-[#0a0a0b] bg-lime-400 text-black">
              {initials}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-white">
                  {profile.displayName ?? profile.username}
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tier.badge}`}>
                  {tier.label}
                </span>
                {profile.isVerified && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-lime-400/10 text-lime-400 border-lime-400/20">
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <div className="text-sm text-white/35 font-mono">@{profile.username}</div>
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            <button className="text-sm px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Message
            </button>
          </div>
        </div>

        <div className="flex gap-8">

          <div className="flex-1 min-w-0">

            {profile.bio && (
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 mb-4">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">About</div>
                <p className="text-sm text-white/55 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="flex gap-1 mb-4 bg-[#111114] border border-white/[0.07] rounded-xl p-1 w-fit">
              {(['listings', 'reviews'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t ? 'bg-white/[0.07] text-white' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {t === 'listings'
                    ? `Listings (${profile.listings.length})`
                    : `Reviews (${profile._count.reviewsReceived})`}
                </button>
              ))}
            </div>

            {tab === 'listings' && (
              profile.listings.length === 0 ? (
                <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-12 text-center">
                  <div className="text-sm text-white/25 font-mono">No active listings</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile.listings.map((listing) => (
                    <Link href={`/listing/${listing.id}`} key={listing.id}>
                      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 hover:border-white/15 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <div className="text-xs text-white/25 font-mono mb-1.5">
                              {categoryLabel(listing.category)}
                            </div>
                            <div className="text-sm font-semibold text-white mb-1">{listing.title}</div>
                            <div className="text-xs text-white/30 font-mono">
                              {minDelivery(listing)}d delivery · {listing._count.orders} orders
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-bold text-lime-400">
                              from ${minPrice(listing)}
                              <span className="text-xs font-normal text-white/25 font-mono ml-1">USDC</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === 'reviews' && (
              profile.reviewsReceived.length === 0 ? (
                <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-12 text-center">
                  <div className="text-sm text-white/25 font-mono">No reviews yet</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile.reviewsReceived.map((review) => (
                    <div key={review.id} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white">
                            {(review.reviewer.displayName ?? review.reviewer.username ?? '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white/70">
                              {review.reviewer.displayName ?? review.reviewer.username}
                            </div>
                            <div className="text-[10px] text-white/25 font-mono">
                              {review.order.listing.title.slice(0, 40)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/25 font-mono">{timeAgo(review.createdAt)}</span>
                          <span className="text-xs text-lime-400">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

          </div>

          <div className="w-56 shrink-0">
            <div className="sticky top-24 flex flex-col gap-3">

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">Stats</div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Rating', value: avgRating ? `${avgRating.toFixed(1)} ★` : 'No reviews' },
                    { label: 'Completed', value: profile._count.ordersAsSeller },
                    { label: 'Reviews', value: profile._count.reviewsReceived },
                    { label: 'Listings', value: profile._count.listings },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-xs text-white/30 font-mono">{stat.label}</span>
                      <span className="text-sm font-semibold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">Info</div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Member since', value: memberYear },
                    { label: 'Tier', value: tier.label },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-xs text-white/30 font-mono">{item.label}</span>
                      <span className="text-xs font-medium text-white/70">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="text-xs text-white/15 font-mono hover:text-white/30 transition-colors text-center py-2">
                Report this seller
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
