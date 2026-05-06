import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'
import BannedBanner from '@/components/shared/BannedBanner'
import { prisma } from '@/lib/prisma'
import { getFUSDPrice } from '@/lib/besc'

const categories = [
  { icon: '⚙️', name: 'Development', count: null, slug: 'development' },
  { icon: '🎨', name: 'Design & Art', count: null, slug: 'design-art' },
  { icon: '📣', name: 'Marketing', count: null, slug: 'marketing' },
  { icon: '👥', name: 'Community', count: null, slug: 'community' },
  { icon: '📞', name: 'Callers / KOLs', count: null, slug: 'callers-kols' },
  { icon: '📊', name: 'Strategy', count: null, slug: 'strategy' },
  { icon: '🔍', name: 'Research & Alpha', count: null, slug: 'research-alpha' },
  { icon: '⚖️', name: 'Brokerage', count: null, slug: 'brokerage' },
  { icon: '📋', name: 'Compliance', count: null, slug: 'compliance' },
  { icon: '🔗', name: 'BESC Ecosystem', count: null, slug: 'besc-ecosystem' },
]

const tierStyles: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: {
        seller: { select: { username: true, displayName: true, tier: true } },
        packages: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const [userCount, listingCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
    ])
    return { userCount, listingCount, orderCount }
  } catch {
    return { userCount: 2400, listingCount: 342, orderCount: 1200 }
  }
}

export default async function HomePage() {
  const [featuredListings, stats, fusdPrice] = await Promise.all([getFeaturedListings(), getStats(), getFUSDPrice()])

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      <Navbar />
      <Suspense><BannedBanner /></Suspense>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-16">
        <div className="flex items-center gap-2 text-lime-400 text-xs tracking-[3px] uppercase font-mono mb-6">
          <span className="w-5 h-px bg-lime-400 inline-block" />
          Decentralized Crypto Talent
        </div>
        <h1 className="text-6xl font-bold leading-[1.04] tracking-[-2.5px] text-white mb-5">
          Hire the people<br />
          who move <span className="text-lime-400">markets.</span>
        </h1>
        <p className="text-lg text-white/40 leading-relaxed max-w-lg mb-9">
          The first trust-layered freelance marketplace built for the degen economy. Devs, callers, community builders, KOLs — escrow-backed, wallet-native.
        </p>
        <div className="flex gap-3">
          <Link href="/marketplace">
            <button className="text-base font-semibold px-7 py-3.5 rounded-lg bg-lime-400 text-black hover:bg-lime-300 transition-all">
              Browse Talent
            </button>
          </Link>
          <Link href="/onboarding">
            <button className="text-base px-7 py-3.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
              List Your Services
            </button>
          </Link>
        </div>

        {/* STATS */}
        <div className="flex gap-10 mt-14 pt-10 border-t border-white/[0.06]">
          {[
            { num: `${stats.userCount.toLocaleString()}+`, label: 'Verified Freelancers' },
            { num: `${stats.listingCount}+`, label: 'Active Listings' },
            { num: `${stats.orderCount}+`, label: 'Jobs Completed' },
            { num: '72hr', label: 'Escrow Window' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white tracking-tight">{s.num}</div>
              <div className="text-xs text-white/30 font-mono tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Browse by category</div>
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((cat) => (
            <Link href={`/marketplace/${cat.slug}`} key={cat.slug}>
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-lime-400/30 transition-all group">
                <div className="text-xl mb-3">{cat.icon}</div>
                <div className="text-sm font-semibold text-white mb-1 group-hover:text-lime-400 transition-colors">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      {featuredListings.length > 0 && (
        <section className="max-w-4xl mx-auto px-8 pb-16">
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Featured listings</div>
          <div className="grid grid-cols-2 gap-3">
            {featuredListings.map((listing) => {
              const minPrice = listing.packages[0]?.price ?? 0
              const initials = (listing.seller.displayName ?? listing.seller.username ?? '?').slice(0, 2).toUpperCase()
              return (
                <Link href={`/listing/${listing.id}`} key={listing.id}>
                  <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/15 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-9 h-9 rounded-full bg-lime-400/20 flex items-center justify-center text-sm font-bold text-lime-400">
                        {initials}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded border ${tierStyles[listing.seller.tier]}`}>
                        {listing.seller.tier}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white leading-snug mb-2">{listing.title}</div>
                    <div className="text-xs text-white/30 mb-4">
                      by {listing.seller.displayName ?? listing.seller.username} · {listing.category.replace(/_/g, ' ').toLowerCase()}
                    </div>
                    <div className="flex justify-between items-center pt-3.5 border-t border-white/[0.05]">
                      <div className="text-base font-bold text-lime-400">
                        from ${minPrice} <span className="text-xs font-normal text-white/25 font-mono">USDC</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* TRUST SECTION */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-10">
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-7">Why ShillMarket</div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: '🔒', title: 'Escrow protected', desc: 'Every job is held in escrow. Funds release only when both parties confirm delivery.' },
              { icon: '🏆', title: 'Tier verified talent', desc: 'Anon, Verified, Elite, and Institution tiers — earn trust or prove it with skin in the game.' },
              { icon: '⚡', title: 'Pay your way', desc: 'USDC, ETH, SOL, or credit card. On-chain wallet or email login. Your choice, always.' },
            ].map((item) => (
              <div key={item.title}>
                <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-base mb-3">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-white mb-2">{item.title}</div>
                <div className="text-xs text-white/35 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-8 py-8 max-w-4xl mx-auto flex justify-between items-center text-xs text-white/20 font-mono">
        <span>ShillMarket © 2025</span>
        <div className="flex items-center gap-2 text-lime-400/60">
          <span>🔗</span>
          <span className="font-mono">$FUSD</span>
          <span className="text-lime-400 font-semibold">${fusdPrice.toFixed(2)}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/25">Powered by BESC HyperChain</span>
        </div>
        <div className="flex gap-6">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Docs</span>
        </div>
      </footer>

    </main>
  )
}
