import Link from "next/link"
import Navbar from "@/components/shared/navbar/Navbar"

const categories = [
  { icon: "⚙️", name: "Development", count: 342, slug: "development" },
  { icon: "🎨", name: "Design & Art", count: 218, slug: "design-art" },
  { icon: "📣", name: "Marketing", count: 189, slug: "marketing" },
  { icon: "👥", name: "Community", count: 156, slug: "community" },
  { icon: "📞", name: "Callers / KOLs", count: 94, slug: "callers-kols" },
  { icon: "📊", name: "Strategy", count: 71, slug: "strategy" },
  { icon: "🔍", name: "Research & Alpha", count: 58, slug: "research-alpha" },
  { icon: "⚖️", name: "Brokerage", count: 67, slug: "brokerage" },
  { icon: "📋", name: "Compliance", count: 33, slug: "compliance" },
]

const featuredListings = [
  { id: "1", initials: "0x", color: "lime", tier: "ELITE", title: "Full Solana smart contract audit + deploy", seller: "0xNullByte", category: "Development", price: 450, rating: 4.9, reviews: 38 },
  { id: "2", initials: "DG", color: "violet", tier: "VERIFIED", title: "Twitter spaces host + X thread campaign", seller: "DegenGhost", category: "Callers / KOLs", price: 180, rating: 4.7, reviews: 62 },
  { id: "3", initials: "PF", color: "orange", tier: "ELITE", title: "Telegram community setup, mod team + first 500 members", seller: "PumpForge", category: "Community", price: 320, rating: 5.0, reviews: 14 },
  { id: "4", initials: "AX", color: "blue", tier: "VERIFIED", title: "Memecoin brand kit — PFP, banner, memes pack", seller: "AlphaXDesign", category: "Design & Art", price: 95, rating: 4.8, reviews: 27 },
]

const avatarColors: Record<string, string> = {
  lime: "bg-lime-400 text-black",
  violet: "bg-violet-500 text-white",
  orange: "bg-orange-500 text-white",
  blue: "bg-sky-500 text-white",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      <Navbar />

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
          <Link href="/dashboard/listings/new">
            <button className="text-base px-7 py-3.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
              List Your Services
            </button>
          </Link>
        </div>

        {/* STATS */}
        <div className="flex gap-10 mt-14 pt-10 border-t border-white/[0.06]">
          {[
            { num: "2,400+", label: "Verified Freelancers" },
            { num: "$1.2M", label: "Jobs Completed" },
            { num: "9", label: "Service Categories" },
            { num: "72hr", label: "Escrow Window" },
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
                <div className="text-xs font-mono text-white/25">{cat.count} listings</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Featured listings</div>
        <div className="grid grid-cols-2 gap-3">
          {featuredListings.map((listing) => (
            <Link href={`/listing/${listing.id}`} key={listing.id}>
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/15 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[listing.color]}`}>
                    {listing.initials}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                    listing.tier === "ELITE"
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                  }`}>
                    {listing.tier}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white leading-snug mb-2">{listing.title}</div>
                <div className="text-xs text-white/30 mb-4">by {listing.seller} · {listing.category}</div>
                <div className="flex justify-between items-center pt-3.5 border-t border-white/[0.05]">
                  <div className="text-base font-bold text-lime-400">
                    ${listing.price} <span className="text-xs font-normal text-white/25 font-mono">USDC</span>
                  </div>
                  <div className="text-xs text-white/30">
                    <span className="text-white font-medium">{listing.rating}</span> ★ ({listing.reviews})
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-10">
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-7">Why ShillMarket</div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: "🔒", title: "Escrow protected", desc: "Every job is held in escrow. Funds release only when both parties confirm delivery." },
              { icon: "🏆", title: "Tier verified talent", desc: "Anon, Verified, Elite, and Institution tiers — earn trust or prove it with skin in the game." },
              { icon: "⚡", title: "Pay your way", desc: "USDC, ETH, SOL, or credit card. On-chain wallet or email login. Your choice, always." },
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
        <div className="flex gap-6">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Docs</span>
        </div>
      </footer>

    </main>
  )
}
