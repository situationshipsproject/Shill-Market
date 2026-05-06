import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const privyUserId = req.headers.get('x-privy-user-id')
  if (!privyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { privyUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) ?? 'avatar'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${type}/${user.id}-${Date.now()}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
