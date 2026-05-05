'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import { useUser } from '@/hooks/useUser'
import { CATEGORIES } from '@/config/categories'

type Step = 1 | 2 | 3 | 4 | 5

const TIERS = [
  {
    key: 'ANON',
    label: 'Anon',
    price: 'Free',
    color: 'border-white/10',
    activeColor: 'border-white/30 bg-white/[0.03]',
    badgeColor: 'text-white/40 bg-white/5 border-white/10',
    description: 'Wallet only. No vetting. Limited to $500 max job value.',
    features: ['Wallet connect only', 'Post listings', 'Max job: $500', 'No badge'],
  },
  {
    key: 'VERIFIED',
    label: 'Verified',
    price: '$1 USDC',
    color: 'border-white/10',
    activeColor: 'border-lime-400/40 bg-lime-400/[0.03]',
    badgeColor: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
    description: 'Social + optional KYC. Higher limits, verified badge.',
    features: ['Verified badge on profile', 'Max job: $5,000', 'Priority in search', 'Review system access'],
    recommended: true,
  },
  {
    key: 'ELITE',
    label: 'Elite',
    price: 'Apply',
    color: 'border-white/10',
    activeColor: 'border-violet-400/40 bg-violet-500/[0.03]',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    description: 'Fully vetted by ShillMarket team. High-value jobs unlocked.',
    features: ['Elite badge', 'Unlimited job value', 'Featured placement', 'Contract access', 'Direct referrals'],
  },
]

const STEPS = [
  { num: 1, label: 'Identity' },
  { num: 2, label: 'Tier' },
  { num: 3, label: 'Categories' },
  { num: 4, label: 'First Listing' },
  { num: 5, label: 'Go Live' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { privyUser, getAccessToken } = useUser()
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1 — Identity
  const [identity, setIdentity] = useState({
    username: '',
    displayName: '',
    bio: '',
  })

  // Step 2 — Tier
  const [selectedTier, setSelectedTier] = useState('VERIFIED')

  // Step 3 — Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Step 4 — First listing
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    deliveryDays: '',
  })

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const canNext = () => {
    if (step === 1) return identity.username.length >= 3 && identity.displayName.length >= 2
    if (step === 2) return !!selectedTier
    if (step === 3) return selectedCategories.length > 0
    if (step === 4) return listing.title.length > 5
    return true
  }

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as Step)
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      const token = await getAccessToken()
      const authHeader = { Authorization: `Bearer ${token}` }

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          walletAddress: privyUser?.wallet?.address,
          email: privyUser?.email?.address,
        }),
      })

      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          username: identity.username,
          displayName: identity.displayName,
          bio: identity.bio,
        }),
      })

      if (listing.title && listing.description) {
        await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({
            title: listing.title,
            description: listing.description,
            category: selectedCategories[0]?.toUpperCase().replace('-', '_'),
            tags: [],
            packages: [
              {
                name: 'Standard',
                description: listing.description,
                price: listing.price || '50',
                currency: 'USDC',
                deliveryDays: listing.deliveryDays || '7',
                revisions: '1',
                features: [],
              },
            ],
          }),
        })
      }

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 pt-12 pb-24">

        {/* PROGRESS */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    step > s.num
                      ? 'bg-lime-400 text-black'
                      : step === s.num
                      ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                      : 'bg-white/[0.04] text-white/20 border border-white/[0.07]'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <div className={`text-[10px] font-mono mt-1.5 ${
                    step >= s.num ? 'text-white/50' : 'text-white/20'
                  }`}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 transition-all ${
                    step > s.num ? 'bg-lime-400/40' : 'bg-white/[0.06]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 — IDENTITY */}
        {step === 1 && (
          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
              Step 1 of 5
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Build your identity
            </h2>
            <p className="text-white/40 text-sm mb-8">
              This is how buyers will find and remember you. Make it count.
            </p>

            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 space-y-5">
              <div>
                <label className="text-xs text-white/40 font-mono block mb-1.5">
                  Username <span className="text-white/20">(unique, no spaces)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm font-mono">@</span>
                  <input
                    value={identity.username}
                    onChange={(e) => setIdentity({ ...identity, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="0xnullbyte"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 font-mono block mb-1.5">Display Name</label>
                <input
                  value={identity.displayName}
                  onChange={(e) => setIdentity({ ...identity, displayName: e.target.value })}
                  placeholder="How you want to appear on listings"
                  className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 font-mono block mb-1.5">
                  Bio <span className="text-white/20">(optional but recommended)</span>
                </label>
                <textarea
                  value={identity.bio}
                  onChange={(e) => setIdentity({ ...identity, bio: e.target.value })}
                  placeholder="Tell buyers who you are, what you've built, and why they should trust you..."
                  rows={4}
                  className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — TIER */}
        {step === 2 && (
          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
              Step 2 of 5
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Choose your tier
            </h2>
            <p className="text-white/40 text-sm mb-8">
              Your tier is your reputation signal. Buyers filter by tier. Start where you are — you can upgrade anytime.
            </p>

            <div className="flex flex-col gap-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.key}
                  onClick={() => setSelectedTier(tier.key)}
                  className={`relative bg-[#111114] border rounded-xl p-5 cursor-pointer transition-all ${
                    selectedTier === tier.key ? tier.activeColor : 'border-white/[0.07] hover:border-white/15'
                  }`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-2.5 left-5">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-lime-400 text-black font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedTier === tier.key ? 'border-lime-400' : 'border-white/20'
                      }`}>
                        {selectedTier === tier.key && (
                          <div className="w-2 h-2 rounded-full bg-lime-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{tier.label}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tier.badgeColor}`}>
                          {tier.key}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-bold font-mono ${
                      tier.price === 'Free' ? 'text-white/40' : tier.price === 'Apply' ? 'text-violet-400' : 'text-lime-400'
                    }`}>
                      {tier.price}
                    </span>
                  </div>

                  <p className="text-xs text-white/40 mb-3 ml-7">{tier.description}</p>

                  <div className="flex flex-wrap gap-2 ml-7">
                    {tier.features.map((f) => (
                      <span key={f} className="text-[10px] font-mono text-white/30 bg-white/[0.03] px-2 py-1 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — CATEGORIES */}
        {step === 3 && (
          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
              Step 3 of 5
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              What do you offer?
            </h2>
            <p className="text-white/40 text-sm mb-8">
              Pick every category that applies. You can always change this later.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat.slug)
                return (
                  <div
                    key={cat.slug}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`bg-[#111114] border rounded-xl p-4 cursor-pointer transition-all ${
                      active
                        ? 'border-lime-400/40 bg-lime-400/[0.03]'
                        : 'border-white/[0.07] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{cat.icon}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        active ? 'bg-lime-400 border-lime-400' : 'border-white/20'
                      }`}>
                        {active && <span className="text-black text-[10px] font-bold">✓</span>}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold transition-colors ${active ? 'text-lime-400' : 'text-white'}`}>
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-white/25 mt-0.5 leading-relaxed">
                      {cat.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — FIRST LISTING */}
        {step === 4 && (
          <div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
              Step 4 of 5
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Create your first listing
            </h2>
            <p className="text-white/40 text-sm mb-8">
              Just the basics for now. You can add packages, tags, and details from your dashboard after.
            </p>

            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 space-y-5">
              <div>
                <label className="text-xs text-white/40 font-mono block mb-1.5">
                  Listing Title
                </label>
                <input
                  value={listing.title}
                  onChange={(e) => setListing({ ...listing, title: e.target.value })}
                  placeholder="e.g. I will audit your Solana smart contract"
                  className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 font-mono block mb-1.5">
                  Description
                </label>
                <textarea
                  value={listing.description}
                  onChange={(e) => setListing({ ...listing, description: e.target.value })}
                  placeholder="What do you offer? What's your experience? What can buyers expect?"
                  rows={4}
                  className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Starting Price (USDC)
                  </label>
                  <input
                    type="number"
                    value={listing.price}
                    onChange={(e) => setListing({ ...listing, price: e.target.value })}
                    placeholder="50"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Delivery (days)
                  </label>
                  <input
                    type="number"
                    value={listing.deliveryDays}
                    onChange={(e) => setListing({ ...listing, deliveryDays: e.target.value })}
                    placeholder="7"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 flex items-start gap-2">
                <span className="text-sm">💡</span>
                <p className="text-xs text-white/30 leading-relaxed">
                  You can skip this step and create listings from your dashboard. This just gets you started fast.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="mt-3 text-xs text-white/25 font-mono hover:text-white/40 transition-colors"
            >
              Skip this step →
            </button>
          </div>
        )}

        {/* STEP 5 — GO LIVE */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">🚀</div>
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-3">
              Step 5 of 5
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              You&apos;re ready to go live
            </h2>
            <p className="text-white/40 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Your profile is set up. Your first listing is queued. You&apos;re about to join{' '}
              <span className="text-white">2,400+ freelancers</span> in the only marketplace built for the degen economy.
            </p>

            {/* SUMMARY */}
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 text-left mb-8 max-w-sm mx-auto">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">
                Your Setup
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Username', value: `@${identity.username || 'not set'}` },
                  { label: 'Tier', value: selectedTier },
                  { label: 'Categories', value: `${selectedCategories.length} selected` },
                  { label: 'First listing', value: listing.title ? listing.title.slice(0, 30) + '...' : 'Skipped' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
                    <span className="text-xs text-white/30 font-mono">{item.label}</span>
                    <span className="text-xs font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={submitting}
              className="w-full max-w-sm mx-auto block py-4 rounded-xl bg-lime-400 text-black font-bold text-base hover:bg-lime-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Setting up your account...' : 'Launch My Profile →'}
            </button>
          </div>
        )}

        {/* NAV BUTTONS */}
        {step < 5 && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="text-sm px-5 py-2.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <div className="text-xs text-white/20 font-mono">
              {step} / 5
            </div>
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="text-sm px-5 py-2.5 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
