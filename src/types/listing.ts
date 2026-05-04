export type Category =
  | 'DEVELOPMENT'
  | 'DESIGN_ART'
  | 'MARKETING'
  | 'COMMUNITY'
  | 'CALLERS_KOLS'
  | 'STRATEGY'
  | 'RESEARCH_ALPHA'
  | 'BROKERAGE'
  | 'COMPLIANCE'

export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'REMOVED'

export interface Package {
  id: string
  name: string
  description: string
  price: number
  currency: string
  deliveryDays: number
  revisions: number
  features: string[]
}

export interface Listing {
  id: string
  createdAt: Date
  title: string
  description: string
  category: Category
  tags: string[]
  packages: Package[]
  status: ListingStatus
  isFeatured: boolean
  sellerId: string
  seller?: {
    id: string
    username?: string
    displayName?: string
    avatarUrl?: string
    tier: string
  }
}
