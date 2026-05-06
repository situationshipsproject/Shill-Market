import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — read all messages in a conversation (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { privyUserId } })
  if (!caller?.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, username: true, displayName: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ messages })
}

// PATCH — flag or unflag a message
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { privyUserId } })
  if (!caller?.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { messageId, flagged } = await req.json()
  if (!messageId || typeof flagged !== 'boolean') {
    return NextResponse.json({ error: 'Missing messageId or flagged' }, { status: 400 })
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message || message.conversationId !== conversationId) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  const updated = await prisma.message.update({ where: { id: messageId }, data: { flagged } })
  return NextResponse.json({ message: updated })
}
