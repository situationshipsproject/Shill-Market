import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { privyUserId } })
  if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [
      totalUsers,
      totalListings,
      totalOrders,
      disputedOrders,
      completedOrders,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'DISPUTED' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, username: true, displayName: true, tier: true, createdAt: true, isAdmin: true, isSuperAdmin: true },
      }),
    ])

    const revenue = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalOrders,
        disputedOrders,
        completedOrders,
        totalRevenue: revenue._sum.amount ?? 0,
      },
      recentUsers,
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
