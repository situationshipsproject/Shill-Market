export type UserTier = 'ANON' | 'VERIFIED' | 'ELITE' | 'INSTITUTION'

export interface User {
  id: string
  createdAt: Date
  walletAddress?: string
  email?: string
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  tier: UserTier
  isVerified: boolean
  kycCompleted: boolean
}
