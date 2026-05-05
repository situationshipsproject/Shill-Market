'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'
import { CATEGORIES } from '@/config/categories'

interface Package {
  id: string
  name: string
  description: string
  price: number
  currency: string
  deliveryDays: number
  revisions: number
  features: string[]
}

interface Listing {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  status: string
  packages: Package[]
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { privyUser } = useUser()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
  })

  const [packages, setPackages] = useState<{
    name: string
    description: string
    price: string
    deliveryDays: string
    revisions: string
    features: string
  }[]>([])

  useEffect(() => {
    if (!id) return
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const l = data.listing
      setListing(l)
      setForm({
        title: l.title,
        description: l.description,
        category: l.category.toLowerCase().replace(/_/g, '-'),
        tags: l.tags.join(', '),
      })
      setPackages(
        l.packages.map((p: Package) => ({
          name: p.name,
          description: p.description,
          price: p.price.toString(),
          deliveryDays: p.deliveryDays.toString(),
          revisions: p.revisions.toString(),
          features: p.features.join(', '),
        }))
      )
    } catch (err) {
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const updatePackage = (index: number, field: string, value: string) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
    )
  }

  const handleSave = async () => {
    if (!privyUser?.id) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          title: form.title,
          description: form.description,
          category: form.category,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          packages: packages.map((pkg) => ({
            ...pkg,
            price: parseFloat(pkg.price),
            deliveryDays: parseInt(pkg.deliveryDays),
            revisions: parseInt(pkg.revisions),
            features: pkg.features.split(',').map((f) => f.trim()).filter(Boolean),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        router.push('/dashboard/listings')
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">
                Dashboard / Listings
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Edit Listing</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard/listings')}
              className="text-xs text-white/30 font-mono hover:text-white/60 transition-colors"
            >
              ← Back to listings
            </button>
          </div>

          <div className="space-y-4">

            {/* BASIC INFO */}
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6">
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Basic Info</div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* PACKAGES */}
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
                      className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 font-mono block mb-1.5">Delivery (days)</label>
                    <input
                      type="number"
                      value={pkg.deliveryDays}
                      onChange={(e) => updatePackage(i, 'deliveryDays', e.target.value)}
                      className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400/30 transition-colors"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Description</label>
                  <input
                    value={pkg.description}
                    onChange={(e) => updatePackage(i, 'description', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">
                    Features <span className="text-white/20">(comma separated)</span>
                  </label>
                  <input
                    value={pkg.features}
                    onChange={(e) => updatePackage(i, 'features', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400/30 transition-colors"
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
                onClick={handleSave}
                disabled={saving}
                className="px-7 py-3 rounded-lg bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all disabled:opacity-40"
              >
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
              </button>
              <button
                onClick={() => router.push('/dashboard/listings')}
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
