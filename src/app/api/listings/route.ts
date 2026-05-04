import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPrivyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tier = searchParams.get('tier')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const privyUserId = searchParams.get('privyUserId')
  const own = searchParams.get('own') === 'true'

  try {
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      ...(category && {
        category: category.toUpperCase().replace(/-/g, '_') as never,
      }),
      ...(tier && {
        seller: { tier: tier as never },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(minPrice || maxPrice
        ? {
            packages: {
              some: {
                price: {
                  ...(minPrice && { gte: parseFloat(minPrice) }),
                  ...(maxPrice && { lte: parseFloat(maxPrice) }),
                },
              },
            },
          }
        : {}),
    }

    if (own && privyUserId) {
      const user = await prisma.user.findUnique({ where: { privyUserId } })
      if (user) {
        where.sellerId = user.id
        delete where.status
      }
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            tier: true,
          },
        },
        packages: {
          orderBy: { price: 'asc' },
        },
        _count: { select: { orders: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, listings, data: listings })
  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const privyUserId = await verifyPrivyToken(req)
  if (!privyUserId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { title, description, category, tags, packages } = body

    if (!title || !description || !category || !packages?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        tags: tags ?? [],
        sellerId: user.id,
        packages: {
          create: packages.map((pkg: {
            name: string
            description: string
            price: number
            currency?: string
            deliveryDays: number
            revisions?: number
            features?: string[]
          }) => ({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            currency: pkg.currency ?? 'USDC',
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions ?? 1,
            features: pkg.features ?? [],
          })),
        },
      },
      include: { packages: true },
    })

    return NextResponse.json({ success: true, data: listing }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 })
  }
}
