import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — list conversations for current user
export async function GET(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ participant1Id: user.id }, { participant2Id: user.id }] },
      include: {
        participant1: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        participant2: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // count unread per conversation
    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const unread = await prisma.message.count({
          where: { conversationId: c.id, isRead: false, senderId: { not: user.id } },
        })
        return { ...c, unread }
      })
    )

    return NextResponse.json({ conversations: withUnread })
  } catch (err) {
    console.error('[GET /api/messages]', err)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST — send a message to an existing conversation
export async function POST(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const { conversationId, content } = await req.json()
    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing conversationId or content' }, { status: 400 })
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    if (conversation.participant1Id !== user.id && conversation.participant2Id !== user.id) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: { conversationId, senderId: user.id, content: content.trim() },
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })

    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/messages]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
