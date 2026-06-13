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
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalUsers, totalOrders, pendingOrders, totalAgents] = await Promise.all([
      db.user.count(),
      db.dataOrder.count(),
      db.dataOrder.count({ where: { status: 'pending' } }),
      db.user.count({ where: { role: 'agent' } }),
    ])

    const revenueResult = await db.dataOrder.aggregate({
      _sum: { price: true },
      where: { status: 'completed' },
    })

    const recentOrders = await db.dataOrder.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      totalUsers,
      totalOrders,
      pendingOrders,
      totalAgents,
      totalRevenue: revenueResult._sum.price || 0,
      recentOrders,
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
