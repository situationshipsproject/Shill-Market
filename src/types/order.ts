export type OrderStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED'

export type EscrowStatus = 'HOLDING' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'
export type PaymentMethod = 'CRYPTO_WALLET' | 'CREDIT_CARD' | 'INTERNAL_BALANCE'

export interface Order {
  id: string
  createdAt: Date
  updatedAt: Date
  status: OrderStatus
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  txHash?: string
  escrowStatus: EscrowStatus
  deliveredAt?: Date
  completedAt?: Date
  disputedAt?: Date
  buyerId: string
  sellerId: string
  listingId: string
  packageId: string
}
