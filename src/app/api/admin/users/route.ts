import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { privyUserId } })
  if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 25
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { walletAddress: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          walletAddress: true,
          tier: true,
          isVerified: true,
          isAdmin: true,
          isSuperAdmin: true,
          createdAt: true,
          _count: { select: { listings: true, ordersAsBuyer: true, ordersAsSeller: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[GET /api/admin/users]', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
