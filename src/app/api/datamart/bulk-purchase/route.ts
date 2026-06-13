import { db } from '@/lib/db'
import { mapNetworkToCode, isValidGhanaPhone, placeDatamartBulkOrder } from '@/lib/datamart'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

interface BulkOrderItem {
  phoneNumber: string
  network: string
  capacity: number
  ref?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, orders } = body as {
      userId?: string
      orders: BulkOrderItem[]
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      )
    }

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'orders array is required and must not be empty' },
        { status: 400 },
      )
    }

    if (orders.length > 50) {
      return NextResponse.json(
        { error: 'Bulk purchase limited to 50 orders at a time' },
        { status: 400 },
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 })
    }

    // Validate and map each order
    const mappedOrders: Array<{
      phoneNumber: string
      network: string
      capacity: number
      ref?: string
    }> = []

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]

      if (!order.phoneNumber || !order.network || !order.capacity) {
        return NextResponse.json(
          { error: `Order at index ${i} is missing required fields (phoneNumber, network, capacity)` },
          { status: 400 },
        )
      }

      if (!isValidGhanaPhone(order.phoneNumber)) {
        return NextResponse.json(
          { error: `Order at index ${i} has an invalid Ghana phone number` },
          { status: 400 },
        )
      }

      let networkCode: string
      try {
        networkCode = mapNetworkToCode(order.network)
      } catch {
        return NextResponse.json(
          { error: `Order at index ${i} has an invalid network: ${order.network}` },
          { status: 400 },
        )
      }

      mappedOrders.push({
        phoneNumber: order.phoneNumber,
        network: networkCode,
        capacity: Number(order.capacity),
        ref: order.ref || undefined,
      })
    }

    // Generate idempotency key
    const idempotencyKey = uuidv4()

    // Create local DataOrder records for all orders
    const localOrders = await Promise.all(
      mappedOrders.map((order) =>
        db.dataOrder.create({
          data: {
            userId,
            phoneNumber: order.phoneNumber,
            network: order.network,
            capacity: order.capacity,
            price: 0,
            costPrice: 0,
            profit: 0,
            status: 'pending',
            paymentMethod: 'wallet',
          },
        })
      )
    )

    // Place bulk order with DataMart
    try {
      const bulkResult = await placeDatamartBulkOrder(mappedOrders, idempotencyKey)

      // Update local orders with results
      if (bulkResult.results && Array.isArray(bulkResult.results)) {
        for (let i = 0; i < bulkResult.results.length; i++) {
          const result = bulkResult.results[i]
          const localOrder = localOrders[i]

          if (localOrder) {
            const status = result.status?.toLowerCase() || 'processing'
            const statusMap: Record<string, string> = {
              created: 'processing',
              processing: 'processing',
              completed: 'completed',
              failed: 'failed',
              pending: 'pending',
            }

            await db.dataOrder.update({
              where: { id: localOrder.id },
              data: {
                reference: result.orderId || result.ref || null,
                status: statusMap[status] || 'processing',
              },
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        result: bulkResult,
        localOrderIds: localOrders.map((o) => o.id),
        idempotencyKey,
      })
    } catch (datamartError) {
      console.error('DataMart bulk purchase failed:', datamartError)

      // Mark all local orders as failed
      await Promise.all(
        localOrders.map((order) =>
          db.dataOrder.update({
            where: { id: order.id },
            data: { status: 'failed' },
          })
        )
      )

      return NextResponse.json(
        {
          error: 'DataMart bulk purchase failed. All orders recorded locally as failed.',
          localOrderIds: localOrders.map((o) => o.id),
          details: datamartError instanceof Error ? datamartError.message : 'Unknown error',
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('POST /api/datamart/bulk-purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk purchase' },
      { status: 500 },
    )
  }
}
