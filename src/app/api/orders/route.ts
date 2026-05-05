import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const privyUserId = searchParams.get('privyUserId')
    const role = searchParams.get('role') // 'buyer' | 'seller'

    if (!privyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { privyUserId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: role === 'seller' ? { sellerId: user.id } : { buyerId: user.id },
      include: {
        listing: { select: { id: true, title: true, category: true } },
        package: { select: { name: true, price: true, currency: true, deliveryDays: true } },
        buyer: { select: { id: true, username: true, displayName: true, walletAddress: true, tier: true } },
        seller: { select: { id: true, username: true, displayName: true, walletAddress: true, tier: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[GET /api/orders]', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { privyUserId, listingId, packageId, paymentMethod, txHash } = body

    if (!privyUserId || !listingId || !packageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buyer = await prisma.user.findUnique({ where: { privyUserId } })
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { listing: true },
    })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (pkg.listing.sellerId === buyer.id) {
      return NextResponse.json({ error: 'Cannot purchase your own listing' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        sellerId: pkg.listing.sellerId,
        listingId,
        packageId,
        amount: pkg.price,
        currency: pkg.currency,
        paymentMethod: paymentMethod ?? 'CRYPTO_WALLET',
        txHash: txHash ?? null,
        status: 'PENDING',
        escrowStatus: 'HOLDING',
      },
      include: {
        listing: { select: { title: true } },
        package: { select: { name: true, price: true, deliveryDays: true } },
        seller: { select: { username: true, displayName: true } },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
