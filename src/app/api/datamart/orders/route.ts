import { db } from '@/lib/db'
import { getDatamartOrders, isDatamartConfigured } from '@/lib/datamart'
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

// GET /api/datamart/orders — Fetch orders (admin or user)
export async function GET(request: NextRequest) {
  try {
    const isAdmin = verifyAdminToken(request)
    const userIdHeader = request.headers.get('user-id')
    const userIdCookie = request.cookies.get('user-id')?.value
    const userId = userIdHeader || userIdCookie

    // If admin, try external DataMart API first
    if (isAdmin && isDatamartConfigured()) {
      try {
        const orders = await getDatamartOrders()
        return NextResponse.json({ orders, configured: true })
      } catch {
        // Fall through to local DB
      }
    }

    // For users or admin fallback: query local Prisma DB
    if (!isAdmin && !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (!isAdmin && userId) {
      where.userId = userId
    }
    if (statusFilter) {
      where.status = statusFilter
    }

    const orders = await db.dataOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      reference: order.reference,
      phoneNumber: order.phoneNumber,
      network: order.network,
      capacity: order.capacity,
      price: order.price,
      status: order.status,
      paymentMethod: order.paymentMethod,
      completedAt: order.completedAt?.toISOString() ?? null,
      agentCommission: order.agentCommission,
      createdAt: order.createdAt.toISOString(),
    }))

    return NextResponse.json({ orders: formattedOrders, configured: true })
  } catch (error) {
    console.error('GET /api/datamart/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    )
  }
}
