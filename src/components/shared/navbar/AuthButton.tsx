'use client'

import { usePrivy } from '@privy-io/react-auth'

export default function AuthButton() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  if (!ready) {
    return (
      <div className="flex gap-2 items-center">
        <div className="w-20 h-8 rounded-md bg-white/5 animate-pulse" />
        <div className="w-32 h-8 rounded-md bg-white/5 animate-pulse" />
      </div>
    )
  }

  if (authenticated) {
    const address = user?.wallet?.address
    const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : (user?.email?.address ?? 'Account')

    return (
      <div className="flex gap-2 items-center">
        <span className="text-xs text-white/40 font-mono">{short}</span>
        <button
          onClick={logout}
          className="text-sm px-4 py-1.5 rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={login}
        className="text-sm px-4 py-1.5 rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
      >
        Sign In
      </button>
      <button
        onClick={login}
        className="text-sm font-semibold px-4 py-1.5 rounded-md bg-lime-400 text-black hover:bg-lime-300 transition-all"
      >
        Connect Wallet
      </button>
    </div>
  )
}
