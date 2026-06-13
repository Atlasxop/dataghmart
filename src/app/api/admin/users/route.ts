import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('admin-token')
  if (!token) return false
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  try {
    const tokenBuf = Buffer.from(token)
    const secretBuf = Buffer.from(secret)
    if (tokenBuf.length !== secretBuf.length) return false
    return timingSafeEqual(tokenBuf, secretBuf)
  } catch { return false }
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('q')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) where.OR = [
      { email: { contains: search } },
      { fullName: { contains: search } },
      { phone: { contains: search } },
    ]

    const users = await db.user.findMany({
      where,
      include: { agentProfile: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
