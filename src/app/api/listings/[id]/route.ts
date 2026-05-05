import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            tier: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: {
                ordersAsSeller: { where: { status: 'COMPLETED' } },
                reviewsReceived: true,
              },
            },
          },
        },
        packages: { orderBy: { price: 'asc' } },
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            review: {
              include: {
                reviewer: {
                  select: { username: true, displayName: true, avatarUrl: true, tier: true },
                },
              },
            },
          },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: listing })
  } catch (err) {
    console.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch listing' }, { status: 500 })
  }
}
