'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'

const mockListing = {
  id: '1',
  title: 'Full Solana smart contract audit + deploy',
  description: `I've audited and deployed 40+ Solana programs across DeFi, NFT, and memecoin projects. You get a full line-by-line security review, a written report of all vulnerabilities found, fixes applied, and a clean deploy to mainnet.\n\nI work fast without cutting corners. Every audit includes a public report you can share with your community to build trust — that's how you actually get buyers comfortable holding your token.\n\nHave worked with teams on pump.fun, Magic Eden launchpad, and several private raises. References available on request.`,
  category: 'Development',
  tags: ['solana', 'smart contract', 'audit', 'deploy', 'rust'],
  isFeatured: true,
  seller: {
    initials: '0x',
    color: 'lime',
    username: '0xNullByte',
    displayName: '0xNullByte',
    tier: 'ELITE',
    memberSince: 'Jan 2024',
    completedJobs: 38,
    rating: 4.9,
    responseTime: '< 2 hours',
    bio: 'Solana dev. 3 years on-chain. Former auditor at a private security firm. I work with serious teams only.',
  },
  packages: [
    {
      id: 'pkg-1',
      name: 'Basic',
      price: 150,
      currency: 'USDC',
      deliveryDays: 5,
      revisions: 1,
      description: 'Audit of a single program up to 500 lines. Written report. No deploy.',
      features: ['Single program audit', 'Written vulnerability report', 'Up to 500 lines of code', '1 revision'],
    },
    {
      id: 'pkg-2',
      name: 'Standard',
      price: 450,
      currency: 'USDC',
      deliveryDays: 7,
      revisions: 2,
      description: 'Full audit + fixes applied + mainnet deploy. Up to 2,000 lines.',
      features: ['Full audit up to 2,000 lines', 'Fixes applied by me', 'Mainnet deploy', 'Public audit report', '2 revisions'],
    },
    {
      id: 'pkg-3',
      name: 'Premium',
      price: 1200,
      currency: 'USDC',
      deliveryDays: 14,
      revisions: 5,
      description: 'Full suite — audit, fixes, deploy, tokenomics review, post-launch monitoring for 30 days.',
      features: ['Everything in Standard', 'Tokenomics review', '30-day post-launch monitoring', 'Priority comms', '5 revisions', 'NDA available'],
    },
  ],
  reviews: [
    { id: 'r1', reviewer: 'PumpForge', initials: 'PF', color: 'orange', rating: 5, comment: 'Caught a critical reentrancy bug before we launched. Would have been a rug. Absolute legend.', date: '2 weeks ago' },
    { id: 'r2', reviewer: 'DegenGhost', initials: 'DG', color: 'violet', rating: 5, comment: 'Fast, communicative, delivered early. Report was detailed enough to share publicly which boosted community trust.', date: '1 month ago' },
    { id: 'r3', reviewer: 'AlphaXDesign', initials: 'AX', color: 'blue', rating: 4, comment: 'Solid work. Took a bit longer than estimated but the quality was there.', date: '2 months ago' },
  ],
}

const avatarColors: Record<string, string> = {
  lime: 'bg-lime-400 text-black',
  violet: 'bg-violet-500 text-white',
  orange: 'bg-orange-500 text-white',
  blue: 'bg-sky-500 text-white',
}

const tierStyles: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

export default function ListingPage() {
  const [selectedPkg, setSelectedPkg] = useState(mockListing.packages[1])
  const listing = mockListing

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24">

        <div className="flex items-center gap-2 text-xs text-white/25 font-mono mb-8">
          <Link href="/marketplace" className="hover:text-white/50 transition-colors">Marketplace</Link>
          <span>/</span>
          <span>{listing.category}</span>
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[listing.seller.color]}`}>
                {listing.seller.initials}
              </div>
              <span className="text-sm text-white/70 font-medium">{listing.seller.displayName}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tierStyles[listing.seller.tier]}`}>
                {listing.seller.tier}
              </span>
              <span className="text-xs text-white/25 font-mono">·</span>
              <span className="text-xs text-white/25 font-mono">{listing.seller.rating} ★</span>
              <span className="text-xs text-white/25 font-mono">({listing.seller.completedJobs} jobs)</span>
            </div>

            <div className="flex gap-2 flex-wrap mb-8">
              {listing.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-white/35">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mb-10">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">About this service</div>
              <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">
                Reviews ({listing.reviews.length})
              </div>
              <div className="flex flex-col gap-4">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[review.color]}`}>
                          {review.initials}
                        </div>
                        <span className="text-sm font-medium text-white/70">{review.reviewer}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/25 font-mono">{review.date}</span>
                        <span className="text-xs text-lime-400 font-mono">{'★'.repeat(review.rating)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — STICKY ORDER PANEL */}
          <div className="w-80 shrink-0">
            <div className="sticky top-24">

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden mb-3">

                <div className="flex border-b border-white/[0.07]">
                  {listing.packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`flex-1 py-3 text-xs font-semibold font-mono transition-all ${
                        selectedPkg.id === pkg.id
                          ? 'text-white bg-white/[0.04] border-b-2 border-lime-400'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-2xl font-bold text-white">
                      ${selectedPkg.price}
                      <span className="text-xs font-normal text-white/25 font-mono ml-1">{selectedPkg.currency}</span>
                    </div>
                    <div className="text-xs text-white/30 font-mono text-right">
                      <div>{selectedPkg.deliveryDays}d delivery</div>
                      <div>{selectedPkg.revisions} revision{selectedPkg.revisions > 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <p className="text-xs text-white/45 leading-relaxed mb-4">{selectedPkg.description}</p>

                  <div className="flex flex-col gap-2 mb-5">
                    {selectedPkg.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                        </div>
                        <span className="text-xs text-white/50">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 rounded-lg bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all mb-2">
                    Order Now — ${selectedPkg.price}
                  </button>
                  <button className="w-full py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
                    Message Seller
                  </button>

                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-base">🔒</span>
                    <p className="text-[11px] text-white/30 leading-relaxed">
                      Funds are held in escrow and only released when you confirm delivery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">About the seller</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[listing.seller.color]}`}>
                    {listing.seller.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{listing.seller.displayName}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${listing.seller.tier === 'ELITE' ? 'text-violet-400' : 'text-lime-400'}`}>
                      {listing.seller.tier}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/40 leading-relaxed mb-4">{listing.seller.bio}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Rating', value: `${listing.seller.rating} ★` },
                    { label: 'Jobs done', value: listing.seller.completedJobs },
                    { label: 'Response', value: listing.seller.responseTime },
                    { label: 'Member since', value: listing.seller.memberSince },
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
