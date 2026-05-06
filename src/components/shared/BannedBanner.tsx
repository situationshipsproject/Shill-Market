'use client'

import { useSearchParams } from 'next/navigation'

export default function BannedBanner() {
  const params = useSearchParams()
  if (!params.get('banned')) return null

  return (
    <div className="w-full bg-red-500/10 border-b border-red-500/20 px-8 py-3 flex items-center justify-center gap-3">
      <span className="text-red-400 text-sm font-semibold">Your account has been suspended.</span>
      <span className="text-red-400/60 text-sm">Contact support to appeal.</span>
    </div>
  )
}
