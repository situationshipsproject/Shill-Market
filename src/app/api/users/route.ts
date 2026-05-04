import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPrivyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const privyUserId = await verifyPrivyToken(req)
  if (!privyUserId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { walletAddress, email } = body

    const user = await prisma.user.upsert({
      where: { privyUserId },
      update: {
        ...(walletAddress && { walletAddress }),
        ...(email && { email }),
      },
      create: {
        privyUserId,
        ...(walletAddress && { walletAddress }),
        ...(email && { email }),
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('[POST /api/users]', err)
    return NextResponse.json({ success: false, error: 'Failed to upsert user' }, { status: 500 })
  }
}
