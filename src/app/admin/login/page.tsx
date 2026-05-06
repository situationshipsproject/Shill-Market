'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUser } from '@/hooks/useUser'

export default function AdminLoginPage() {
  const { login, authenticated, ready } = usePrivy()
  const { dbUser } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (authenticated && dbUser) {
      if (dbUser.isAdmin) router.replace('/admin')
      else router.replace('/')
    }
  }, [ready, authenticated, dbUser, router])

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] flex items-center justify-center"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-5">
            <span className="text-2xl font-bold text-violet-400">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-sm text-white/35">ShillMarket Admin Panel</p>
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-4 text-center">
            Authorized Personnel Only
          </div>
          <p className="text-sm text-white/40 text-center mb-6 leading-relaxed">
            Connect your wallet to authenticate. Only accounts with admin privileges can access the panel.
          </p>
          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-all"
          >
            Connect Wallet
          </button>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-white/20 font-mono hover:text-white/40 transition-colors">
            ← Back to ShillMarket
          </a>
        </div>
      </div>
    </div>
  )
}
