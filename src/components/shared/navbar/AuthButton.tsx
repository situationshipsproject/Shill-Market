'use client'

import { usePrivy } from '@privy-io/react-auth'

export default function AuthButton() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (authenticated && user) {
    const display =
      user.wallet?.address
        ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
        : user.email?.address?.split('@')[0] ?? 'anon'

    return (
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10">
          <div className="w-2 h-2 rounded-full bg-lime-400" />
          <span className="text-xs font-mono text-white/70">{display}</span>
        </div>
        <button
          onClick={logout}
          className="text-sm px-4 py-1.5 rounded-md border border-white/10 text-white/40 hover:text-white/60 transition-all"
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
