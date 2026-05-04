import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPrivyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const privyUserId = await verifyPrivyToken(req)
  if (!privyUserId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('[GET /api/users/me]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const privyUserId = await verifyPrivyToken(req)
  if (!privyUserId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { username, displayName, bio, avatarUrl, bannerUrl } = body

    const user = await prisma.user.update({
      where: { privyUserId },
      data: {
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('[PATCH /api/users/me]', err)
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}
