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

    return NextResponse.json({ listing })
  } catch (err) {
    console.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const body = await req.json()
    const { privyUserId, title, description, category, tags, packages } = body

    const user = await prisma.user.findUnique({ where: { privyUserId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId !== user.id) {
      return NextResponse.json({ error: 'Not your listing' }, { status: 403 })
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        category: category.toUpperCase().replace(/-/g, '_'),
        tags: tags ?? [],
      },
    })

    if (packages?.length) {
      const existing = await prisma.package.findMany({ where: { listingId: id } })
      for (const pkg of packages) {
        const match = existing.find((e) => e.name === pkg.name)
        if (match) {
          await prisma.package.update({
            where: { id: match.id },
            data: {
              description: pkg.description,
              price: pkg.price,
              deliveryDays: pkg.deliveryDays,
              revisions: pkg.revisions,
              features: pkg.features,
            },
          })
        }
      }
    }

    return NextResponse.json({ listing: updated })
  } catch (err) {
    console.error('[PATCH /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}
