'use client'

import { useState } from 'react'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

export default function SettingsPage() {
  const { dbUser, privyUser } = useUser()
  const [displayName, setDisplayName] = useState(dbUser?.displayName ?? '')
  const [bio, setBio] = useState(dbUser?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!privyUser?.id) return
    setSaving(true)
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          displayName,
          bio,
        }),
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
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          </div>

          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 max-w-xl">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Profile</div>

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

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all disabled:opacity-40"
                >
                  {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-6 max-w-xl mt-4">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-5">Account</div>
            <div className="space-y-3">
              {[
                { label: 'Privy ID', value: privyUser?.id?.slice(0, 24) + '...' },
                { label: 'Wallet', value: dbUser?.walletAddress ? dbUser.walletAddress.slice(0, 8) + '...' + dbUser.walletAddress.slice(-6) : 'Not connected' },
                { label: 'Email', value: dbUser?.email ?? 'Not connected' },
                { label: 'Tier', value: dbUser?.tier ?? 'ANON' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
                  <span className="text-xs text-white/30 font-mono">{item.label}</span>
                  <span className="text-xs text-white/60 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
