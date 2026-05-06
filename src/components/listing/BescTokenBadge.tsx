'use client'

import { useEffect, useState } from 'react'

interface TokenData {
  name: string
  symbol: string
  price: number
}

export default function BescTokenBadge({ contractAddress }: { contractAddress: string }) {
  const [token, setToken] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const BESC_API = 'https://api.beschypercharts.com'
    Promise.all([
      fetch(`${BESC_API}/token/info/${contractAddress}`).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${BESC_API}/token/price/${contractAddress}`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([info, price]) => {
      if (info) {
        setToken({
          name: info.name ?? 'Unknown',
          symbol: info.symbol ?? contractAddress.slice(0, 6),
          price: price?.priceUsd ?? price?.price ?? 0,
        })
      }
    }).finally(() => setLoading(false))
  }, [contractAddress])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
        <span className="text-lime-400/40 text-xs font-mono animate-pulse">🔗 BESC...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-lime-400/[0.04] border border-lime-400/20 w-fit">
      <span className="text-base">🔗</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-semibold text-lime-400">
          {token ? `$${token.symbol}` : contractAddress.slice(0, 10) + '...'}
        </span>
        {token && token.price > 0 && (
          <span className="text-xs font-mono text-lime-400/70">${token.price.toFixed(4)}</span>
        )}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20">
          VERIFIED ON BESC
        </span>
      </div>
    </div>
  )
}
