'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

export default function SettingsPage() {
  const { dbUser, privyUser } = useUser()
  const [displayName, setDisplayName] = useState(dbUser?.displayName ?? '')
  const [bio, setBio] = useState(dbUser?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(dbUser?.avatarUrl ?? '')
  const [bannerUrl, setBannerUrl] = useState(dbUser?.bannerUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const initials = ((dbUser?.displayName ?? dbUser?.username ?? dbUser?.email ?? '?')[0]).toUpperCase()

  async function uploadFile(file: File, type: 'avatar' | 'banner'): Promise<string | null> {
    if (!privyUser?.id) return null
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-privy-user-id': privyUser.id },
      body: form,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.url ?? null
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const url = await uploadFile(file, 'avatar')
    if (url) setAvatarUrl(url)
    setUploadingAvatar(false)
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    const url = await uploadFile(file, 'banner')
    if (url) setBannerUrl(url)
    setUploadingBanner(false)
  }

  const handleSave = async () => {
    if (!privyUser?.id) return
    setSaving(true)
    try {
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
        body: JSON.stringify({ displayName, bio, avatarUrl, bannerUrl }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0 max-w-xl">
          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          </div>

          {/* Banner + Avatar */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden mb-4">
            {/* Banner */}
            <div
              className="relative h-32 bg-gradient-to-r from-[#18181c] via-[#1e1e24] to-[#18181c] cursor-pointer group overflow-hidden"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerUrl ? (
                <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-mono tracking-widest">
                  {uploadingBanner ? 'UPLOADING...' : 'CLICK TO UPLOAD BANNER'}
                </span>
              </div>
              {bannerUrl && (
                <div className="absolute top-2 right-2 text-[10px] font-mono text-white/40 bg-black/40 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  1500×500px recommended
                </div>
              )}
            </div>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

            {/* Avatar overlapping the banner */}
            <div className="px-5 pb-5">
              <div className="relative -mt-8 mb-4 w-fit">
                <div
                  className="w-16 h-16 rounded-2xl border-4 border-[#111114] overflow-hidden cursor-pointer relative group bg-lime-400 flex items-center justify-center"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-black">{initials}</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all rounded-[10px]">
                    <span className="text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight">
                      {uploadingAvatar ? '...' : 'UPLOAD'}
                    </span>
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4">Profile</div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Display Name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How your name appears publicly"
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell buyers who you are..."
                    rows={4}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors resize-none"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || uploadingAvatar || uploadingBanner}
                    className="px-6 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Account</div>
            <div className="space-y-4">
              {[
                { label: 'Privy ID', value: privyUser?.id ?? '' },
                { label: 'Wallet', value: dbUser?.walletAddress ?? '' },
                { label: 'Email', value: dbUser?.email ?? '' },
                { label: 'Tier', value: dbUser?.tier ?? 'ANON' },
              ].map((item) => (
                <div key={item.label}>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">{item.label}</label>
                  <input
                    readOnly
                    value={item.value || 'Not connected'}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-xs text-white/60 font-mono outline-none cursor-text"
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
