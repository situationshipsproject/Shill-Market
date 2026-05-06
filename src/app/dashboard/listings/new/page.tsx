'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'
import { CATEGORIES } from '@/config/categories'

const EMPTY_PACKAGE = {
  name: '',
  description: '',
  price: '',
  currency: 'USDC',
  deliveryDays: '',
  revisions: '1',
  features: '',
}

export default function NewListingPage() {
  const router = useRouter()
  const { privyUser } = useUser()

  const [form, setForm] = useState({ title: '', description: '', category: '', tags: '', tokenContract: '' })
  const [packages, setPackages] = useState([
    { ...EMPTY_PACKAGE, name: 'Basic' },
    { ...EMPTY_PACKAGE, name: 'Standard' },
    { ...EMPTY_PACKAGE, name: 'Premium' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updatePackage = (index: number, field: string, value: string) => {
    setPackages((prev) => prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)))
  }

  const handleSubmit = async () => {
    if (!privyUser?.id) { setError('Not authenticated'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-privy-user-id': privyUser.id,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category.toUpperCase().replace(/-/g, '_'),
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          tokenContract: form.tokenContract.trim() || null,
          packages: packages.map((pkg) => ({
            name: pkg.name,
            description: pkg.description,
            price: parseFloat(pkg.price) || 0,
            currency: pkg.currency,
            deliveryDays: parseInt(pkg.deliveryDays) || 7,
            revisions: parseInt(pkg.revisions) || 1,
            features: pkg.features.split(',').map((f) => f.trim()).filter(Boolean),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create listing')
      router.push('/dashboard/listings')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">
              Dashboard / Listings
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Listing</h1>
          </div>

          <div className="space-y-4">

            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Basic Info</div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. I will audit your Solana smart contract"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400/30 transition-colors"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what you offer, your experience, and what buyers can expect..."
                    rows={5}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Tags <span className="text-white/20">(comma separated)</span>
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="solana, audit, rust, defi"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Token Contract <span className="text-white/20">(optional — BESC HyperChain)</span>
                  </label>
                  <input
                    value={form.tokenContract}
                    onChange={(e) => setForm({ ...form, tokenContract: e.target.value })}
                    placeholder="0x..."
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                  <p className="text-[10px] text-white/20 font-mono mt-1">
                    If set, shows live token price and a Verified on BESC badge on your listing.
                  </p>
                </div>
              </div>
            </div>

            {packages.map((pkg, i) => (
              <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-xl p-6">
                <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">
                  {pkg.name} Package
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-white/40 font-mono block mb-1.5">Price (USDC)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => updatePackage(i, 'price', e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 font-mono block mb-1.5">Delivery (days)</label>
                    <input
                      type="number"
                      value={pkg.deliveryDays}
                      onChange={(e) => updatePackage(i, 'deliveryDays', e.target.value)}
                      placeholder="7"
                      className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Description</label>
                  <input
                    value={pkg.description}
                    onChange={(e) => updatePackage(i, 'description', e.target.value)}
                    placeholder="What's included in this package?"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Features <span className="text-white/20">(comma separated)</span>
                  </label>
                  <input
                    value={pkg.features}
                    onChange={(e) => updatePackage(i, 'features', e.target.value)}
                    placeholder="Full audit, Written report, 2 revisions"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-mono">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title || !form.category}
                className="px-7 py-3 rounded-lg bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-7 py-3 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
