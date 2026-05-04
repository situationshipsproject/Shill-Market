import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'
import { CATEGORIES } from '@/config/categories'

const mockListings = [
  { id: '1', initials: '0x', color: 'lime', tier: 'ELITE', title: 'Full Solana smart contract audit + deploy', seller: '0xNullByte', category: 'Development', price: 450, rating: 4.9, reviews: 38, deliveryDays: 7 },
  { id: '2', initials: 'DG', color: 'violet', tier: 'VERIFIED', title: 'Twitter spaces host + X thread campaign', seller: 'DegenGhost', category: 'Callers / KOLs', price: 180, rating: 4.7, reviews: 62, deliveryDays: 3 },
  { id: '3', initials: 'PF', color: 'orange', tier: 'ELITE', title: 'Telegram community setup, mod team + first 500 members', seller: 'PumpForge', category: 'Community', price: 320, rating: 5.0, reviews: 14, deliveryDays: 14 },
  { id: '4', initials: 'AX', color: 'blue', tier: 'VERIFIED', title: 'Memecoin brand kit — PFP, banner, memes pack', seller: 'AlphaXDesign', category: 'Design & Art', price: 95, rating: 4.8, reviews: 27, deliveryDays: 5 },
  { id: '5', initials: 'RK', color: 'lime', tier: 'VERIFIED', title: 'Pump.fun token launch strategy + tokenomics review', seller: 'RektKing', category: 'Strategy', price: 200, rating: 4.6, reviews: 19, deliveryDays: 4 },
  { id: '6', initials: 'SR', color: 'orange', tier: 'ANON', title: 'Alpha research report — any sector, 48hr delivery', seller: 'SigmaResearch', category: 'Research & Alpha', price: 75, rating: 4.5, reviews: 41, deliveryDays: 2 },
  { id: '7', initials: 'NK', color: 'violet', tier: 'ELITE', title: 'Full KOL campaign — 10 callers, coordinated launch', seller: 'NukeKOL', category: 'Callers / KOLs', price: 1200, rating: 4.9, reviews: 8, deliveryDays: 10 },
  { id: '8', initials: 'WB', color: 'blue', tier: 'INSTITUTION', title: 'Cayman Islands legal entity setup for crypto project', seller: 'WebsterBrokers', category: 'Compliance', price: 3500, rating: 5.0, reviews: 6, deliveryDays: 21 },
]

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

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Marketplace</div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Browse Talent</h1>
        <p className="text-white/40 text-base">
          {mockListings.length} listings across {CATEGORIES.length} categories
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-20 flex gap-8">

        {/* SIDEBAR */}
        <aside className="w-56 shrink-0">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
            />
          </div>

          <div className="mb-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Category</div>
            <div className="flex flex-col gap-1">
              <Link href="/marketplace" className="text-sm px-3 py-2 rounded-lg text-lime-400 bg-lime-400/10 font-medium">
                All Categories
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/marketplace/${cat.slug}`}
                  className="text-sm px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Seller Tier</div>
            <div className="flex flex-col gap-1">
              {['All', 'ELITE', 'VERIFIED', 'ANON', 'INSTITUTION'].map((tier) => (
                <button key={tier} className="text-sm px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-left">
                  {tier === 'All' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Budget (USDC)</div>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Under $50', value: '0-50' },
                { label: '$50 — $200', value: '50-200' },
                { label: '$200 — $500', value: '200-500' },
                { label: '$500 — $2,000', value: '500-2000' },
                { label: '$2,000+', value: '2000-up' },
              ].map((range) => (
                <button key={range.value} className="text-sm px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-left">
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-white/30 font-mono">{mockListings.length} results</span>
            <select className="bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-white/60 outline-none cursor-pointer">
              <option>Sort: Recommended</option>
              <option>Sort: Price Low → High</option>
              <option>Sort: Price High → Low</option>
              <option>Sort: Top Rated</option>
              <option>Sort: Newest</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mockListings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id}>
                <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/15 transition-all h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[listing.color]}`}>
                        {listing.initials}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/70">{listing.seller}</div>
                        <div className="text-[10px] text-white/25 font-mono">{listing.category}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border ${tierStyles[listing.tier]}`}>
                      {listing.tier}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white leading-snug mb-auto">
                    {listing.title}
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/[0.05]">
                    <div>
                      <div className="text-base font-bold text-lime-400">
                        ${listing.price}{' '}
                        <span className="text-xs font-normal text-white/25 font-mono">USDC</span>
                      </div>
                      <div className="text-[10px] text-white/25 font-mono mt-0.5">{listing.deliveryDays}d delivery</div>
                    </div>
                    <div className="text-xs text-white/30 text-right">
                      <div className="text-white font-medium">{listing.rating} ★</div>
                      <div className="text-white/25 font-mono text-[10px]">({listing.reviews})</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
