'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

export default function SettingsPage() {
  const { dbUser, privyUser } = useUser()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!dbUser || initialized) return
    setDisplayName(dbUser.displayName ?? '')
    setBio(dbUser.bio ?? '')
    setAvatarUrl(dbUser.avatarUrl ?? '')
    setBannerUrl(dbUser.bannerUrl ?? '')
    setTwitterUrl(dbUser.twitterUrl ?? '')
    setGithubUrl(dbUser.githubUrl ?? '')
    setTiktokUrl(dbUser.tiktokUrl ?? '')
    setWebsiteUrl(dbUser.websiteUrl ?? '')
    setTelegramUrl(dbUser.telegramUrl ?? '')
    setInitialized(true)
  }, [dbUser, initialized])
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const initials = ((dbUser?.displayName ?? dbUser?.username ?? dbUser?.email ?? '?')[0]).toUpperCase()

  function compressImage(file: File, maxW: number, maxH: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width, maxH / img.height)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(objectUrl)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = objectUrl
    })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const dataUrl = await compressImage(file, 300, 300)
    setAvatarUrl(dataUrl)
    setUploadingAvatar(false)
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    const dataUrl = await compressImage(file, 1200, 400)
    setBannerUrl(dataUrl)
    setUploadingBanner(false)
  }

  const handleSave = async () => {
    if (!privyUser?.id) return
    setSaving(true)
    try {
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
        body: JSON.stringify({ displayName, bio, avatarUrl, bannerUrl, twitterUrl, githubUrl, tiktokUrl, websiteUrl, telegramUrl }),
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
                <Image src={bannerUrl} alt="Banner" fill className="object-cover" unoptimized />
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
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
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

          {/* Social Links */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 mb-4">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Social Links</div>
            <div className="space-y-3">
              {[
                { label: '𝕏 Twitter / X', value: twitterUrl, set: setTwitterUrl, placeholder: 'https://x.com/yourhandle' },
                { label: 'GitHub', value: githubUrl, set: setGithubUrl, placeholder: 'https://github.com/yourname' },
                { label: 'TikTok', value: tiktokUrl, set: setTiktokUrl, placeholder: 'https://tiktok.com/@yourhandle' },
                { label: 'Website', value: websiteUrl, set: setWebsiteUrl, placeholder: 'https://yoursite.com' },
                { label: 'Telegram', value: telegramUrl, set: setTelegramUrl, placeholder: 'https://t.me/yourhandle' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="text-xs text-white/40 font-mono block mb-1.5">{label}</label>
                  <input
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all disabled:opacity-40"
              >
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
              </button>
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
