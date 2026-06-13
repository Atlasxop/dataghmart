import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { getDatamartOrders } from '@/lib/datamart'

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

    // Fetch orders from DataMart API
    try {
      const orders = await getDatamartOrders()
      return NextResponse.json({ orders })
    } catch {
      // Fallback to local DB if DataMart API fails
      const localOrders = await db.dataOrder.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ orders: localOrders })
    }
  } catch (error) {
    console.error('Admin orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Try to update in local DB
    try {
      const order = await db.dataOrder.update({
        where: { id: Number(orderId) },
        data: { status },
      })
      return NextResponse.json({ order })
    } catch {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Admin orders PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
