'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import OrderModal from '@/components/order/OrderModal'
import BescTokenBadge from '@/components/listing/BescTokenBadge'
import { useUser } from '@/hooks/useUser'

const tierStyles: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

interface Package {
  id: string
  name: string
  price: number
  currency: string
  deliveryDays: number
  revisions: number
  description: string
  features: string[]
}

interface Seller {
  id: string
  username: string | null
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  tier: string
  isVerified: boolean
  createdAt: string
  _count: { ordersAsSeller: number; reviewsReceived: number }
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { username: string | null; displayName: string | null; tier: string }
}

interface Listing {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  tokenContract: string | null
  seller: Seller
  packages: Package[]
  orders: { review: Review | null }[]
}

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const { privyUser, dbUser } = useUser()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [messagingBusy, setMessagingBusy] = useState(false)

  async function startConversation() {
    if (!privyUser?.id || !listing) return
    if (!dbUser) { router.push('/onboarding'); return }
    setMessagingBusy(true)
    const res = await fetch('/api/messages/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
      body: JSON.stringify({ recipientId: listing.seller.id }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/dashboard/messages?c=${data.conversationId}`)
    }
    setMessagingBusy(false)
  }

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.listing) {
          setListing(data.listing)
          setSelectedPkg(data.listing.packages[1] ?? data.listing.packages[0])
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-sm text-white/40 font-mono">Listing not found.</div>
      </div>
    )
  }

  const pkg = selectedPkg ?? listing.packages[0]
  const listingIdStr = Array.isArray(id) ? id[0] : (id ?? '')
  const reviews = listing.orders.map((o) => o.review).filter(Boolean) as Review[]
  const sellerInitials = (listing.seller.displayName ?? listing.seller.username ?? '?').slice(0, 2).toUpperCase()
  const memberYear = new Date(listing.seller.createdAt).getFullYear()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      {pkg && (
        <OrderModal
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          listingId={listingIdStr}
          listingTitle={listing.title}
          pkg={pkg}
        />
      )}

      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24">

        <div className="flex items-center gap-2 text-xs text-white/25 font-mono mb-8">
          <Link href="/marketplace" className="hover:text-white/50 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="capitalize">{listing.category.replace(/_/g, ' ').toLowerCase()}</span>
          <span>/</span>
          <span className="text-white/40">{listing.title.slice(0, 40)}...</span>
        </div>

        <div className="flex gap-10">

          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0">

            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight mb-4">
              {listing.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-lime-400/20 overflow-hidden relative flex items-center justify-center text-xs font-bold text-lime-400">
                {listing.seller.avatarUrl ? (
                  <Image src={listing.seller.avatarUrl} alt="" fill className="object-cover" unoptimized />
                ) : sellerInitials}
              </div>
              <span className="text-sm text-white/70 font-medium">
                {listing.seller.displayName ?? listing.seller.username}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tierStyles[listing.seller.tier]}`}>
                {listing.seller.tier}
              </span>
              {listing.seller.isVerified && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-lime-400/10 text-lime-400 border-lime-400/20">
                  VERIFIED
                </span>
              )}
              <span className="text-xs text-white/25 font-mono">·</span>
              <span className="text-xs text-white/25 font-mono">{listing.seller._count.ordersAsSeller} jobs done</span>
            </div>

            {listing.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-8">
                {listing.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-white/35">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {listing.tokenContract && (
              <div className="mb-6">
                <BescTokenBadge contractAddress={listing.tokenContract} />
              </div>
            )}

            <div className="mb-10">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">About this service</div>
              <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {reviews.length > 0 && (
              <div>
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">
                  Reviews ({reviews.length})
                </div>
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-lime-400/10 flex items-center justify-center text-xs font-bold text-lime-400">
                            {(review.reviewer.displayName ?? review.reviewer.username ?? '?').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white/70">
                            {review.reviewer.displayName ?? review.reviewer.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/25 font-mono">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-lime-400 font-mono">{'★'.repeat(review.rating)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-80 shrink-0">
            <div className="sticky top-24">

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden mb-3">

                <div className="flex border-b border-white/[0.07]">
                  {listing.packages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPkg(p)}
                      className={`flex-1 py-3 text-xs font-semibold font-mono transition-all ${
                        pkg?.id === p.id
                          ? 'text-white bg-white/[0.04] border-b-2 border-lime-400'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {pkg && (
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-2xl font-bold text-white">
                        ${pkg.price}
                        <span className="text-xs font-normal text-white/25 font-mono ml-1">{pkg.currency}</span>
                      </div>
                      <div className="text-xs text-white/30 font-mono text-right">
                        <div>{pkg.deliveryDays}d delivery</div>
                        <div>{pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    <p className="text-xs text-white/45 leading-relaxed mb-4">{pkg.description}</p>

                    <div className="flex flex-col gap-2 mb-5">
                      {pkg.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                          </div>
                          <span className="text-xs text-white/50">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setOrderModalOpen(true)}
                      className="w-full py-3 rounded-lg bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all mb-2"
                    >
                      Order Now — ${pkg.price}
                    </button>
                    <button
                      onClick={startConversation}
                      disabled={messagingBusy || listing.seller.id === dbUser?.id}
                      className="w-full py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {messagingBusy ? '...' : 'Message Seller'}
                    </button>

                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-base">🔒</span>
                      <p className="text-[11px] text-white/30 leading-relaxed">
                        Funds are held in escrow and only released when you confirm delivery.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">About the seller</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-lime-400/20 overflow-hidden relative flex items-center justify-center text-sm font-bold text-lime-400">
                    {listing.seller.avatarUrl ? (
                      <Image src={listing.seller.avatarUrl} alt="" fill className="object-cover" unoptimized />
                    ) : sellerInitials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {listing.seller.displayName ?? listing.seller.username}
                    </div>
                    <div className={`text-[10px] font-mono mt-0.5 ${listing.seller.tier === 'ELITE' ? 'text-violet-400' : listing.seller.tier === 'INSTITUTION' ? 'text-sky-400' : 'text-lime-400'}`}>
                      {listing.seller.tier}
                    </div>
                  </div>
                </div>

                {listing.seller.bio && (
                  <p className="text-xs text-white/40 leading-relaxed mb-4">{listing.seller.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Jobs done', value: listing.seller._count.ordersAsSeller },
                    { label: 'Reviews', value: listing.seller._count.reviewsReceived },
                    { label: 'Member since', value: memberYear },
                    { label: 'Tier', value: listing.seller.tier },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.03] rounded-lg p-2.5">
                      <div className="text-[10px] text-white/25 font-mono mb-1">{stat.label}</div>
                      <div className="text-xs font-semibold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <Link href={`/profile/${listing.seller.username}`}>
                  <button className="w-full py-2 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white hover:border-white/20 transition-all">
                    View Full Profile
                  </button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
