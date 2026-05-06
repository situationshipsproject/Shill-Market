import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getAdminUser(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return null
  const user = await prisma.user.findUnique({ where: { privyUserId } })
  return user?.isAdmin ? user : null
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
