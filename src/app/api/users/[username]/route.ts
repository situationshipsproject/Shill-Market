import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            packages: { orderBy: { price: 'asc' } },
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { username: true, displayName: true, avatarUrl: true, tier: true },
            },
            listing: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            listings: true,
            ordersAsSeller: { where: { status: 'COMPLETED' } },
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const avgRating =
      user.reviewsReceived.length
        ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
        : null

    return NextResponse.json({ user, avgRating })
  } catch (err) {
    console.error('[GET /api/users/[username]]', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
