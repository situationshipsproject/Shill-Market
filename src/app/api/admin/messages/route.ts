import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — list all conversations with optional search
export async function GET(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { privyUserId } })
  if (!caller?.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search = searchParams.get('search')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { participant1: { username: { contains: search, mode: 'insensitive' as const } } },
          { participant1: { walletAddress: { contains: search, mode: 'insensitive' as const } } },
          { participant2: { username: { contains: search, mode: 'insensitive' as const } } },
          { participant2: { walletAddress: { contains: search, mode: 'insensitive' as const } } },
          { messages: { some: { content: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }
    : {}

  const [total, conversations] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      include: {
        participant1: { select: { id: true, username: true, displayName: true, walletAddress: true } },
        participant2: { select: { id: true, username: true, displayName: true, walletAddress: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return NextResponse.json({ conversations, total, page, pages: Math.ceil(total / limit) })
}
