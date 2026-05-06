import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST — find or create a conversation with a recipient
export async function POST(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const { recipientId } = await req.json()
    if (!recipientId) return NextResponse.json({ error: 'Missing recipientId' }, { status: 400 })
    if (recipientId === user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } })
    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

    // deterministic participant order so we never create duplicates
    const [p1Id, p2Id] = [user.id, recipientId].sort()

    const existing = await prisma.conversation.findFirst({
      where: { participant1Id: p1Id, participant2Id: p2Id },
    })

    if (existing) return NextResponse.json({ conversationId: existing.id })

    const conversation = await prisma.conversation.create({
      data: { participant1Id: p1Id, participant2Id: p2Id },
    })

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/messages/start]', err)
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 })
  }
}
