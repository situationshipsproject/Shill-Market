'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

interface DbUser {
  id: string
  privyUserId: string
  walletAddress?: string
  email?: string
  username?: string
  displayName?: string
  bio?: string | null
  avatarUrl?: string | null
  bannerUrl?: string | null
  tier: 'ANON' | 'VERIFIED' | 'ELITE' | 'INSTITUTION'
  isVerified: boolean
  kycCompleted: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  createdAt: string
  _count?: {
    listings: number
    ordersAsBuyer: number
    ordersAsSeller: number
    reviewsReceived: number
  }
}

export function useUser() {
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy()
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !authenticated || !privyUser) {
      setDbUser(null)
      return
    }

    async function syncUser() {
      setLoading(true)
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            privyUserId: privyUser!.id,
            walletAddress: privyUser?.wallet?.address ?? null,
            email: privyUser?.email?.address ?? null,
          }),
        })

        const res = await fetch('/api/users/me', {
          headers: { 'x-privy-user-id': privyUser!.id },
        })

        if (res.ok) {
          const data = await res.json()
          setDbUser(data.user)
        }
      } catch (err) {
        console.error('[useUser]', err)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [ready, authenticated, privyUser?.id])

  return { ready, authenticated, privyUser, dbUser, loading, getAccessToken }
}
