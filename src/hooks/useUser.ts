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
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  tier: 'ANON' | 'VERIFIED' | 'ELITE' | 'INSTITUTION'
  isVerified: boolean
  kycCompleted: boolean
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
        const token = await getAccessToken()

        // Upsert user on login
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            walletAddress: privyUser?.wallet?.address,
            email: privyUser?.email?.address,
          }),
        })

        // Fetch full user profile
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setDbUser(data.data)
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
