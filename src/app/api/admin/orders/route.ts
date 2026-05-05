import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPrivyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const privyUserId = await verifyPrivyToken(req)
    if (!privyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { privyUserId } })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      include: {
        listing: { select: { title: true, category: true } },
        package: { select: { name: true, price: true } },
        buyer: { select: { username: true, displayName: true, walletAddress: true, email: true } },
        seller: { select: { username: true, displayName: true, walletAddress: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[GET /api/admin/orders]', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
