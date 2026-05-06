import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { privyUserId },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
          include: { packages: true },
          orderBy: { createdAt: 'desc' },
        },
        ordersAsBuyer: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ordersAsSeller: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            listings: true,
            ordersAsBuyer: true,
            ordersAsSeller: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[GET /api/users/me]', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { username, displayName, bio, avatarUrl, bannerUrl, twitterUrl, githubUrl, tiktokUrl, websiteUrl, telegramUrl } = body

    const user = await prisma.user.update({
      where: { privyUserId },
      data: {
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(twitterUrl !== undefined && { twitterUrl: twitterUrl || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(tiktokUrl !== undefined && { tiktokUrl: tiktokUrl || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
        ...(telegramUrl !== undefined && { telegramUrl: telegramUrl || null }),
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[PATCH /api/users/me]', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
