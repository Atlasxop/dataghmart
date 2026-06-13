import { db } from '@/lib/db'
import { getDatamartOrderStatus } from '@/lib/datamart'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'reference query parameter is required' },
        { status: 400 },
      )
    }

    // Fetch order status from DataMart Developer API
    const orderStatus = await getDatamartOrderStatus(reference)

    // Try to update the local DataOrder record if found
    try {
      const localOrder = await db.dataOrder.findFirst({
        where: {
          OR: [
            { reference: reference },
            { reference: String(orderStatus.id) },
          ],
        },
      })

      if (localOrder) {
        const datamartStatus = orderStatus.status?.toLowerCase() || ''
        const statusMap: Record<string, string> = {
          created: 'processing',
          processing: 'processing',
          completed: 'completed',
          failed: 'failed',
          refunded: 'refunded',
          pending: 'pending',
        }

        const mappedStatus = statusMap[datamartStatus]

        if (mappedStatus) {
          // Don't downgrade status (e.g., completed → processing)
          const priorityOrder = ['pending', 'processing', 'completed', 'failed', 'refunded']
          const currentIndex = priorityOrder.indexOf(localOrder.status)
          const newIndex = priorityOrder.indexOf(mappedStatus)

          // Allow updates if: new status is further along, or it's a terminal state change
          const shouldUpdate =
            newIndex > currentIndex ||
            mappedStatus === 'failed' ||
            mappedStatus === 'refunded'

          if (shouldUpdate) {
            await db.dataOrder.update({
              where: { id: localOrder.id },
              data: {
                status: mappedStatus,
                completedAt: mappedStatus === 'completed' ? new Date() : undefined,
              },
            })
          }
        }
      }
    } catch (dbError) {
      // Log but don't fail the request — the DataMart status is still valid
      console.error('Failed to update local DataOrder status:', dbError)
    }

    return NextResponse.json({
      success: true,
      status: orderStatus,
    })
  } catch (error) {
    console.error('GET /api/datamart/order-status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order status from DataMart' },
      { status: 500 },
    )
  }
}
