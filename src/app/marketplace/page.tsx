import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'
import { CATEGORIES } from '@/config/categories'
import { prisma } from '@/lib/prisma'

const tierStyles: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

async function getListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        seller: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, tier: true },
        },
        packages: { orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { orders: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export default async function MarketplacePage() {
  const listings = await getListings()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Marketplace</div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Browse Talent</h1>
        <p className="text-white/40 text-base">
          {listings.length} listings across {CATEGORIES.length} categories
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
            <span className="text-sm text-white/30 font-mono">{listings.length} results</span>
            <select className="bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-white/60 outline-none cursor-pointer">
              <option>Sort: Recommended</option>
              <option>Sort: Price Low → High</option>
              <option>Sort: Price High → Low</option>
              <option>Sort: Top Rated</option>
              <option>Sort: Newest</option>
            </select>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-20 text-white/25 font-mono text-sm">No listings yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((listing) => {
                const minPrice = listing.packages[0]?.price ?? 0
                const deliveryDays = listing.packages[0]?.deliveryDays ?? 0
                return (
                  <Link href={`/listing/${listing.id}`} key={listing.id}>
                    <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/15 transition-all h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-lime-400/20 flex items-center justify-center text-sm font-bold text-lime-400">
                            {(listing.seller.displayName ?? listing.seller.username ?? '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white/70">{listing.seller.displayName ?? listing.seller.username}</div>
                            <div className="text-[10px] text-white/25 font-mono capitalize">{listing.category.replace(/_/g, ' ').toLowerCase()}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${tierStyles[listing.seller.tier]}`}>
                          {listing.seller.tier}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-white leading-snug mb-auto">
                        {listing.title}
                      </div>

                      <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/[0.05]">
                        <div>
                          <div className="text-base font-bold text-lime-400">
                            from ${minPrice}{' '}
                            <span className="text-xs font-normal text-white/25 font-mono">USDC</span>
                          </div>
                          {deliveryDays > 0 && (
                            <div className="text-[10px] text-white/25 font-mono mt-0.5">{deliveryDays}d delivery</div>
                          )}
                        </div>
                        <div className="text-xs text-white/30 text-right">
                          <div className="text-white/25 font-mono text-[10px]">{listing._count.orders} orders</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
