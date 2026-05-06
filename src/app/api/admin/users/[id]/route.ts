import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { privyUserId } })
  if (!caller?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (target.isSuperAdmin && !caller.isSuperAdmin) {
    return NextResponse.json({ error: 'Cannot modify a super admin' }, { status: 403 })
  }

  const body = await req.json()
  const { isAdmin, tier, isVerified, socialsVerified } = body

  // isAdmin changes require super admin
  if (typeof isAdmin === 'boolean' && !caller.isSuperAdmin) {
    return NextResponse.json({ error: 'Only super admins can change admin roles' }, { status: 403 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(typeof isAdmin === 'boolean' && { isAdmin }),
      ...(tier && { tier }),
      ...(typeof isVerified === 'boolean' && { isVerified }),
      ...(typeof socialsVerified === 'boolean' && { socialsVerified }),
    },
    select: {
      id: true, username: true, displayName: true, isAdmin: true, isSuperAdmin: true, tier: true, isVerified: true, socialsVerified: true,
    },
  })

  return NextResponse.json({ user: updated })
}
