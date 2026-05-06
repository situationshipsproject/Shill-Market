import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — fetch messages in a conversation (marks them as read)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participant1: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      participant2: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  })

  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  if (conversation.participant1Id !== user.id && conversation.participant2Id !== user.id) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })

    // mark unread messages from the other participant as read
    await prisma.message.updateMany({
      where: { conversationId, isRead: false, senderId: { not: user.id } },
      data: { isRead: true },
    })

    return NextResponse.json({ conversation, messages })
  } catch (err) {
    console.error('[GET /api/messages/[conversationId]]', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
