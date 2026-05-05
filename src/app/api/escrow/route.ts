import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, orderId, privyUserId } = body

    if (!action || !orderId || !privyUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { privyUserId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true, buyer: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isBuyer = order.buyerId === user.id
    const isSeller = order.sellerId === user.id

    let updatedOrder

    switch (action) {
      case 'deliver':
        if (!isSeller) {
          return NextResponse.json({ error: 'Only the seller can mark as delivered' }, { status: 403 })
        }
        if (order.status !== 'ACTIVE' && order.status !== 'PENDING') {
          return NextResponse.json({ error: 'Order cannot be marked delivered in current state' }, { status: 400 })
        }
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        })
        break

      case 'confirm':
        if (!isBuyer) {
          return NextResponse.json({ error: 'Only the buyer can confirm delivery' }, { status: 403 })
        }
        if (order.status !== 'DELIVERED') {
          return NextResponse.json({ error: 'Order must be delivered before confirming' }, { status: 400 })
        }
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED', escrowStatus: 'RELEASED', completedAt: new Date() },
        })
        break

      case 'dispute':
        if (!isBuyer && !isSeller) {
          return NextResponse.json({ error: 'Only order parties can raise a dispute' }, { status: 403 })
        }
        if (!['ACTIVE', 'PENDING', 'DELIVERED'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot dispute in current order state' }, { status: 400 })
        }
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'DISPUTED', escrowStatus: 'DISPUTED', disputedAt: new Date() },
        })
        break

      case 'admin_release':
      case 'admin_refund':
        if (!user.isAdmin) {
          return NextResponse.json({ error: 'Admin only' }, { status: 403 })
        }
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data:
            action === 'admin_release'
              ? { status: 'COMPLETED', escrowStatus: 'RELEASED', completedAt: new Date() }
              : { status: 'REFUNDED', escrowStatus: 'REFUNDED' },
        })
        break

      case 'activate':
        if (order.status !== 'PENDING') {
          return NextResponse.json({ error: 'Order is not pending' }, { status: 400 })
        }
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'ACTIVE' },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ order: updatedOrder })
  } catch (err) {
    console.error('[POST /api/escrow]', err)
    return NextResponse.json({ error: 'Failed to process escrow action' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { username: true, displayName: true, walletAddress: true } },
        seller: { select: { username: true, displayName: true, walletAddress: true } },
        listing: { select: { title: true, category: true } },
        package: { select: { name: true, price: true, currency: true, deliveryDays: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[GET /api/escrow]', err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
