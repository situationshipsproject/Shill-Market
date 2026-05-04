'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'

const mockProfile = {
  username: '0xNullByte',
  displayName: '0xNullByte',
  bio: 'Solana dev. 3 years on-chain. Former auditor at a private security firm. I work with serious teams only. 40+ programs audited, zero post-launch exploits on my watch.',
  avatarInitials: '0x',
  avatarColor: 'bg-lime-400 text-black',
  tier: 'ELITE',
  isVerified: true,
  memberSince: 'Jan 2024',
  responseTime: '< 2 hours',
  lastSeen: '2 hours ago',
  stats: {
    completedOrders: 38,
    rating: 4.9,
    reviewCount: 38,
    totalEarned: '$24,400',
  },
  categories: ['Development', 'Strategy'],
  listings: [
    {
      id: '1',
      title: 'Full Solana smart contract audit + deploy',
      category: 'Development',
      minPrice: 150,
      rating: 4.9,
      reviews: 38,
      deliveryDays: 5,
    },
    {
      id: '2',
      title: 'Tokenomics design + whitepaper review',
      category: 'Strategy',
      minPrice: 300,
      rating: 4.8,
      reviews: 12,
      deliveryDays: 7,
    },
    {
      id: '3',
      title: 'Rust smart contract development — custom program',
      category: 'Development',
      minPrice: 800,
      rating: 5.0,
      reviews: 6,
      deliveryDays: 14,
    },
  ],
  reviews: [
    {
      id: 'r1',
      reviewer: 'PumpForge',
      initials: 'PF',
      avatarColor: 'bg-orange-500 text-white',
      rating: 5,
      listingTitle: 'Full Solana smart contract audit + deploy',
      comment: 'Caught a critical reentrancy bug before we launched. Would have been a rug. Absolute legend.',
      date: '2 weeks ago',
    },
    {
      id: 'r2',
      reviewer: 'DegenGhost',
      initials: 'DG',
      avatarColor: 'bg-violet-500 text-white',
      rating: 5,
      listingTitle: 'Full Solana smart contract audit + deploy',
      comment: 'Fast, communicative, delivered early. Report was detailed enough to share publicly which boosted community trust significantly.',
      date: '1 month ago',
    },
    {
      id: 'r3',
      reviewer: 'AlphaXDesign',
      initials: 'AX',
      avatarColor: 'bg-sky-500 text-white',
      rating: 4,
      listingTitle: 'Tokenomics design + whitepaper review',
      comment: 'Solid work. Took a bit longer than estimated but the quality was there. Would hire again.',
      date: '2 months ago',
    },
  ],
}

const tierStyles: Record<string, { badge: string; label: string }> = {
  ANON: { badge: 'bg-white/5 text-white/40 border-white/10', label: 'Anon' },
  VERIFIED: { badge: 'bg-lime-400/10 text-lime-400 border-lime-400/20', label: 'Verified' },
  ELITE: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'Elite' },
  INSTITUTION: { badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', label: 'Institution' },
}

type Tab = 'listings' | 'reviews'

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('listings')
  const profile = mockProfile
  const tier = tierStyles[profile.tier]

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <Navbar />

      {/* BANNER */}
      <div className="h-32 bg-gradient-to-r from-[#111114] via-[#18181c] to-[#111114] border-b border-white/[0.05]" />

      <div className="max-w-5xl mx-auto px-8 pb-24">

        {/* PROFILE HEADER */}
        <div className="flex items-end justify-between -mt-10 mb-8">
          <div className="flex items-end gap-5">
            {/* AVATAR */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-[#0a0a0b] ${profile.avatarColor}`}>
              {profile.avatarInitials}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
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

          {/* LEFT — MAIN CONTENT */}
          <div className="flex-1 min-w-0">

            {/* BIO */}
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 mb-4">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
                About
              </div>
              <p className="text-sm text-white/55 leading-relaxed">{profile.bio}</p>
              <div className="flex gap-2 flex-wrap mt-4">
                {profile.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-white/35"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-1 mb-4 bg-[#111114] border border-white/[0.07] rounded-xl p-1 w-fit">
              {(['listings', 'reviews'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {t === 'listings'
                    ? `Listings (${profile.listings.length})`
                    : `Reviews (${profile.reviews.length})`}
                </button>
              ))}
            </div>

            {/* LISTINGS TAB */}
            {tab === 'listings' && (
              <div className="flex flex-col gap-3">
                {profile.listings.map((listing) => (
                  <Link href={`/listing/${listing.id}`} key={listing.id}>
                    <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 hover:border-white/15 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="text-xs text-white/25 font-mono mb-1.5">
                            {listing.category}
                          </div>
                          <div className="text-sm font-semibold text-white mb-1">
                            {listing.title}
                          </div>
                          <div className="text-xs text-white/30 font-mono">
                            {listing.deliveryDays}d delivery
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-lime-400">
                            from ${listing.minPrice}
                            <span className="text-xs font-normal text-white/25 font-mono ml-1">
                              USDC
                            </span>
                          </div>
                          <div className="text-xs text-white/30 mt-1">
                            <span className="text-white font-medium">{listing.rating}</span> ★{' '}
                            ({listing.reviews})
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === 'reviews' && (
              <div className="flex flex-col gap-3">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[#111114] border border-white/[0.07] rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${review.avatarColor}`}>
                          {review.initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white/70">
                            {review.reviewer}
                          </div>
                          <div className="text-[10px] text-white/25 font-mono">
                            {review.listingTitle.slice(0, 40)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/25 font-mono">{review.date}</span>
                        <span className="text-xs text-lime-400">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT — SIDEBAR STATS */}
          <div className="w-56 shrink-0">
            <div className="sticky top-24 flex flex-col gap-3">

              {/* STATS */}
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">
                  Stats
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Rating', value: `${profile.stats.rating} ★` },
                    { label: 'Completed', value: profile.stats.completedOrders },
                    { label: 'Reviews', value: profile.stats.reviewCount },
                    { label: 'Total earned', value: profile.stats.totalEarned },
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

              {/* META */}
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">
                  Info
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Member since', value: profile.memberSince },
                    { label: 'Response time', value: profile.responseTime },
                    { label: 'Last seen', value: profile.lastSeen },
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

              {/* REPORT */}
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
