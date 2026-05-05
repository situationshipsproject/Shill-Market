import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { privyUserId, walletAddress, email, displayName, bio } = body

    if (!privyUserId) {
      return NextResponse.json({ success: false, error: 'Missing privyUserId' }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { privyUserId },
      update: {
        ...(walletAddress && { walletAddress }),
        ...(email && { email }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
      },
      create: {
        privyUserId,
        ...(walletAddress && { walletAddress }),
        ...(email && { email }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('[POST /api/users]', err)
    return NextResponse.json({ success: false, error: 'Failed to upsert user' }, { status: 500 })
  }
}
