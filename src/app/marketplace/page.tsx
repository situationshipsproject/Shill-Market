'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar/Navbar'
import { CATEGORIES } from '@/config/categories'

interface Listing {
  id: string
  title: string
  category: string
  isFeatured: boolean
  seller: {
    username?: string
    displayName?: string
    tier: string
  }
  packages: {
    price: number
    currency: string
    deliveryDays: number
  }[]
  _count: { orders: number }
}

const tierStyles: Record<string, string> = {
  ANON: 'bg-white/5 text-white/40 border-white/10',
  VERIFIED: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
  ELITE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  INSTITUTION: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

const BUDGET_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 — $200', min: 50, max: 200 },
  { label: '$200 — $500', min: 200, max: 500 },
  { label: '$500 — $2,000', min: 500, max: 2000 },
  { label: '$2,000+', min: 2000, max: 999999 },
]

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [tier, setTier] = useState('')
  const [budget, setBudget] = useState<{ min: number; max: number } | null>(null)
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchListings()
  }, [category, tier, budget, sort, search])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (tier) params.set('tier', tier)
      if (budget) {
        params.set('minPrice', budget.min.toString())
        params.set('maxPrice', budget.max.toString())
      }
      if (sort) params.set('sort', sort)
      if (search) params.set('search', search)

      const res = await fetch(`/api/listings?${params.toString()}`)
      const data = await res.json()
      setListings(data.listings ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const minPrice = (listing: Listing) =>
    listing.packages.length ? Math.min(...listing.packages.map((p) => p.price)) : 0

  const minDelivery = (listing: Listing) =>
    listing.packages.length ? Math.min(...listing.packages.map((p) => p.deliveryDays)) : 0

  const categoryLabel = (cat: string) =>
    cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setCategory('')
    setTier('')
    setBudget(null)
    setSearch('')
    setSearchInput('')
  }

  const hasFilters = category || tier || budget || search

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Marketplace</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Browse Talent</h1>
            <p className="text-white/40 text-base">
              {loading ? '...' : `${listings.length} listings`}
              {category && ` in ${categoryLabel(category)}`}
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-white/30 font-mono hover:text-white/60 transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
            >
              Clear filters ×
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-20 flex gap-8">

        {/* SIDEBAR */}
        <aside className="w-56 shrink-0">

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="mb-6">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
            />
          </form>

          {/* CATEGORIES */}
          <div className="mb-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Category</div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCategory('')}
                className={`text-sm px-3 py-2 rounded-lg text-left transition-all ${
                  !category
                    ? 'text-lime-400 bg-lime-400/10 font-medium'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`text-sm px-3 py-2 rounded-lg text-left transition-all ${
                    category === cat.slug
                      ? 'text-lime-400 bg-lime-400/10 font-medium'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* TIER FILTER */}
          <div className="mb-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Seller Tier</div>
            <div className="flex flex-col gap-1">
              {['', 'ELITE', 'VERIFIED', 'ANON', 'INSTITUTION'].map((t) => (
                <button
                  key={t || 'all'}
                  onClick={() => setTier(t)}
                  className={`text-sm px-3 py-2 rounded-lg text-left transition-all ${
                    tier === t
                      ? 'text-lime-400 bg-lime-400/10 font-medium'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {t || 'All Tiers'}
                </button>
              ))}
            </div>
          </div>

          {/* BUDGET FILTER */}
          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">Budget (USDC)</div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setBudget(null)}
                className={`text-sm px-3 py-2 rounded-lg text-left transition-all ${
                  !budget
                    ? 'text-lime-400 bg-lime-400/10 font-medium'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Any Budget
              </button>
              {BUDGET_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setBudget({ min: range.min, max: range.max })}
                  className={`text-sm px-3 py-2 rounded-lg text-left transition-all ${
                    budget?.min === range.min && budget?.max === range.max
                      ? 'text-lime-400 bg-lime-400/10 font-medium'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* LISTINGS */}
        <div className="flex-1">

          {/* SORT BAR */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-white/30 font-mono">
              {loading ? 'Loading...' : `${listings.length} results`}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-white/60 outline-none cursor-pointer hover:border-white/15 transition-colors"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
            </select>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 h-44 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-[#111114] border border-white/[0.07] border-dashed rounded-xl p-16 text-center">
              <div className="text-3xl mb-4">🔍</div>
              <div className="text-white font-semibold mb-2">No listings found</div>
              <div className="text-sm text-white/35 mb-4">Try adjusting your filters</div>
              <button
                onClick={clearFilters}
                className="text-sm px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((listing) => (
                <Link href={`/listing/${listing.id}`} key={listing.id}>
                  <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/15 transition-all h-full flex flex-col">

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-lime-400 flex items-center justify-center text-sm font-bold text-black">
                          {(listing.seller.displayName ?? listing.seller.username ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white/70">
                            {listing.seller.displayName ?? listing.seller.username ?? 'Anon'}
                          </div>
                          <div className="text-[10px] text-white/25 font-mono">
                            {categoryLabel(listing.category)}
                          </div>
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
                          from ${minPrice(listing)}{' '}
                          <span className="text-xs font-normal text-white/25 font-mono">USDC</span>
                        </div>
                        <div className="text-[10px] text-white/25 font-mono mt-0.5">
                          {minDelivery(listing)}d delivery
                        </div>
                      </div>
                      <div className="text-xs text-white/30 text-right">
                        <div className="text-white/25 font-mono text-[10px]">
                          {listing._count?.orders ?? 0} orders
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
