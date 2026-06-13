import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Status mapping from DataMart events to our DataOrder statuses
const EVENT_STATUS_MAP: Record<string, string> = {
  'order.created': 'processing',
  'order.processing': 'processing',
  'order.completed': 'completed',
  'order.failed': 'failed',
  'order.refunded': 'refunded',
}

// Priority order for status transitions (don't downgrade)
const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  processing: 1,
  completed: 2,
  failed: 3,
  refunded: 3,
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text()

    // Verify HMAC SHA256 signature
    const signature = request.headers.get('x-datamart-signature')
    const webhookSecret =
      process.env.DATAMART_WEBHOOK_SECRET ||
      'whsec_bed65ccee2c01179f6283f4951a29dd9300175ccafd53e09'

    if (!signature) {
      console.error('DataMart webhook: Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('DataMart webhook: Signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the verified body
    const event = JSON.parse(rawBody)
    const eventType: string = event.event || event.type || ''
    const eventData = event.data || event

    // Map event type to our status
    const newStatus = EVENT_STATUS_MAP[eventType]
    if (!newStatus) {
      // Unknown event type — acknowledge but don't process
      console.log('DataMart webhook: Unhandled event type:', eventType)
      return NextResponse.json({ received: true })
    }

    // Find the order by DataMart reference
    const datamartReference =
      eventData.id || eventData.order_id || eventData.reference
    if (!datamartReference) {
      console.error('DataMart webhook: No order ID in event data')
      return NextResponse.json({ received: true })
    }

    // Look up our DataOrder by reference field
    const localOrder = await db.dataOrder.findFirst({
      where: {
        OR: [
          { reference: String(datamartReference) },
        ],
      },
    })

    if (!localOrder) {
      console.error(
        'DataMart webhook: Order not found for reference:',
        datamartReference,
      )
      return NextResponse.json({ received: true })
    }

    // Idempotency: don't downgrade status
    const currentPriority = STATUS_PRIORITY[localOrder.status] ?? -1
    const newPriority = STATUS_PRIORITY[newStatus] ?? -1

    // Allow status update if new status has higher or equal priority
    // But don't downgrade from terminal states (completed, failed, refunded)
    if (
      localOrder.status === 'completed' &&
      newStatus !== 'completed'
    ) {
      console.log(
        'DataMart webhook: Order already completed, skipping update:',
        localOrder.id,
      )
      return NextResponse.json({ received: true })
    }

    if (currentPriority > newPriority) {
      console.log(
        'DataMart webhook: Not downgrading status from',
        localOrder.status,
        'to',
        newStatus,
        'for order:',
        localOrder.id,
      )
      return NextResponse.json({ received: true })
    }

    // Update the order status
    await db.dataOrder.update({
      where: { id: localOrder.id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : undefined,
      },
    })

    console.log(
      `DataMart webhook: Order ${localOrder.id} updated to ${newStatus}`,
    )

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('DataMart webhook: Processing error:', error)
    // Return 200 to avoid retries for transient errors
    return NextResponse.json({ received: true })
  }
}
