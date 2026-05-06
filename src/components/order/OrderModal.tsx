'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { useUser } from '@/hooks/useUser'

const PLATFORM_WALLET = '0x0000000000000000000000000000000000000000'
const FUSD_CONTRACT = '0xcfd6AaA9373CEebcC03D3cd9d87d4033da67B8e9'

interface Package {
  id: string
  name: string
  price: number
  currency: string
  deliveryDays: number
  revisions: number
  description: string
}

interface Props {
  open: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  pkg: Package
}

type Step = 'form' | 'success'
type PaymentMethod = 'USDC' | 'BESC'

export default function OrderModal({ open, onClose, listingId, listingTitle, pkg }: Props) {
  const { login, authenticated } = usePrivy()
  const { privyUser } = useUser()
  const [txHash, setTxHash] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('USDC')

  useEffect(() => {
    if (!open) {
      setTxHash('')
      setError('')
      setStep('form')
      setOrderId('')
      setPaymentMethod('USDC')
    }
  }, [open])

  if (!open) return null

  if (!authenticated) {
    return (
      <Backdrop onClose={onClose}>
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="text-white font-semibold mb-2">Sign in to order</div>
          <p className="text-sm text-white/40 mb-6">Connect your wallet to place an order.</p>
          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </Backdrop>
    )
  }

  const handleSubmit = async () => {
    if (!privyUser?.id) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          listingId,
          packageId: pkg.id,
          paymentMethod: 'CRYPTO_WALLET',
          txHash: txHash.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to place order')
      setOrderId(data.order.id)
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Backdrop onClose={onClose}>
      {step === 'success' ? (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl text-lime-400">✓</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">Order Placed</div>
          <p className="text-sm text-white/40 mb-1">Order #{orderId.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-white/40 mb-8">
            Your order is pending. The seller will begin once payment is confirmed.
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard/orders" className="flex-1">
              <button className="w-full py-3 rounded-xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all">
                View My Orders
              </button>
            </Link>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <div>
              <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-0.5">Confirm Order</div>
              <div className="text-sm font-semibold text-white truncate max-w-xs">{listingTitle}</div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Package summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-white/25 font-mono uppercase mb-1">{pkg.name} Package</div>
                  <div className="text-2xl font-bold text-white">
                    ${pkg.price}
                    <span className="text-xs font-normal text-white/25 font-mono ml-1">{pkg.currency}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-white/30 font-mono">
                  <div>{pkg.deliveryDays}d delivery</div>
                  <div>{pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{pkg.description}</p>
            </div>

            {/* Payment method */}
            <div>
              <div className="text-xs text-white/40 font-mono mb-2">Payment Method</div>
              <div className="grid grid-cols-3 gap-2">
                {(['USDC', 'BESC'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all ${
                      paymentMethod === m
                        ? 'border-lime-400/30 bg-lime-400/5'
                        : 'border-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === m ? 'border-lime-400' : 'border-white/20'
                    }`}>
                      {paymentMethod === m && <div className="w-2 h-2 rounded-full bg-lime-400" />}
                    </div>
                    <span className={`text-xs font-mono font-medium ${paymentMethod === m ? 'text-white' : 'text-white/40'}`}>
                      {m === 'USDC' ? 'USDC' : '$FUSD'}
                    </span>
                  </button>
                ))}
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-white/[0.07] opacity-30 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0" />
                  <span className="text-xs text-white/30 font-mono">Card</span>
                  <span className="text-[8px] font-mono text-white/20 ml-auto">SOON</span>
                </div>
              </div>
              {paymentMethod === 'BESC' && (
                <p className="text-[10px] text-lime-400/50 font-mono mt-1.5">
                  $FUSD on BESC HyperChain — early sellers pay less as price appreciates.
                </p>
              )}
            </div>

            {/* Platform wallet */}
            <div>
              <div className="text-xs text-white/40 font-mono mb-2">
                Send payment to {paymentMethod === 'BESC' ? '(BESC HyperChain)' : '(EVM)'}
              </div>
              <div
                className="flex items-center gap-2 bg-[#0a0a0b] border border-white/[0.07] rounded-xl px-3 py-2.5 cursor-pointer group"
                onClick={() => navigator.clipboard.writeText(paymentMethod === 'BESC' ? FUSD_CONTRACT : PLATFORM_WALLET)}
              >
                <span className="text-xs text-white/60 font-mono flex-1 truncate">
                  {paymentMethod === 'BESC' ? FUSD_CONTRACT : PLATFORM_WALLET}
                </span>
                <span className="text-[10px] text-white/20 group-hover:text-white/50 font-mono transition-colors shrink-0">COPY</span>
              </div>
              <p className="text-[10px] text-white/20 font-mono mt-1.5 leading-relaxed">
                Send exactly ${pkg.price} {paymentMethod === 'BESC' ? 'FUSD' : 'USDC'} to this address, then paste your tx hash below.
              </p>
            </div>

            {/* Transaction hash */}
            <div>
              <label className="text-xs text-white/40 font-mono block mb-2">
                Transaction Hash <span className="text-white/20">(optional — submit now, add later)</span>
              </label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#0a0a0b] border border-white/[0.07] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-mono">
                {error}
              </div>
            )}

            {/* Escrow note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-sm shrink-0">🔒</span>
              <p className="text-[11px] text-white/30 leading-relaxed">
                Funds are held in escrow and only released to the seller when you confirm delivery is complete.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition-all disabled:opacity-40"
            >
              {submitting ? 'Placing Order...' : `Confirm Order — $${pkg.price}`}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Backdrop>
  )
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}
