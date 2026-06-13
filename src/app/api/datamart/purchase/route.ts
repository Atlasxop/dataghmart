import { mapNetworkToCode, isValidGhanaPhone, placeDatamartOrder, isDatamartConfigured } from '@/lib/datamart'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/datamart/purchase — Buy a data bundle via DataMart API
// Payment is handled by DataMart — the store wallet is debited and data is delivered instantly.
// Supports both logged-in users (with userId) and guest purchases.
export async function POST(request: NextRequest) {
  try {
    // Check if DataMart API is configured
    if (!isDatamartConfigured()) {
      return NextResponse.json(
        { error: 'DataMart API is not configured. Payment processing is unavailable. Please contact support.' },
        { status: 503 },
      )
    }

    const body = await request.json()
    const {
      userId,
      phoneNumber,
      network,
      capacity,
      price,
      costPrice,
      paymentMethod,
      customerPhone,
      agentId,
      agentCommission,
    } = body

    // Validate required fields
    if (!phoneNumber || !network || !capacity) {
      return NextResponse.json(
        { error: 'phoneNumber, network, and capacity are required' },
        { status: 400 },
      )
    }

    // Validate Ghana phone number
    if (!isValidGhanaPhone(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid Ghana phone number. Must start with 0 and be 10 digits.' },
        { status: 400 },
      )
    }

    // Map network to DataMart code
    let networkCode: string
    try {
      networkCode = mapNetworkToCode(network)
    } catch {
      return NextResponse.json(
        { error: `Invalid network: ${network}. Supported: MTN, Telecel, AirtelTigo` },
        { status: 400 },
      )
    }

    // Generate idempotency key
    const idempotencyKey = uuidv4()

    // Determine if this is a guest or logged-in purchase
    const isGuest = !userId || userId === 'guest'

    // Place the order directly with DataMart API
    // DataMart handles the payment — it debits from our store wallet
    // and delivers data to the phone number instantly
    try {
      const datamartResult = await placeDatamartOrder(
        phoneNumber,
        networkCode,
        Number(capacity),
        idempotencyKey,
      )

      // Try to save to local DB if user is logged in (non-blocking)
      if (!isGuest) {
        try {
          const { db } = await import('@/lib/db')
          const user = await db.user.findUnique({ where: { id: userId } })
          if (user) {
            await db.dataOrder.create({
              data: {
                userId,
                phoneNumber,
                network: networkCode,
                capacity: Number(capacity),
                price: Number(price) || 0,
                costPrice: Number(costPrice) || 0,
                profit: (Number(price) || 0) - (Number(costPrice) || 0),
                status: 'processing',
                reference: datamartResult.reference || datamartResult.id || null,
                paymentMethod: 'datamart',
                customerPhone: customerPhone || null,
                agentId: agentId || null,
                agentCommission: Number(agentCommission) || 0,
              },
            })
          }
        } catch (dbError) {
          // DB save failure should not block the purchase response
          console.error('Failed to save order to local DB (non-blocking):', dbError)
        }
      }

      return NextResponse.json({
        success: true,
        order: {
          id: datamartResult.id,
          reference: datamartResult.reference || datamartResult.id,
          phoneNumber,
          network: networkCode,
          capacity: Number(capacity),
          price: Number(price) || 0,
          status: 'processing',
          createdAt: new Date().toISOString(),
        },
        datamartOrderId: datamartResult.id,
        datamartReference: datamartResult.reference,
        idempotencyKey,
        isGuest,
        paymentSource: 'datamart',
      })
    } catch (datamartError) {
      console.error('DataMart order placement failed:', datamartError)

      // Try to record failure in DB if user is logged in
      if (!isGuest) {
        try {
          const { db } = await import('@/lib/db')
          const user = await db.user.findUnique({ where: { id: userId } })
          if (user) {
            await db.dataOrder.create({
              data: {
                userId,
                phoneNumber,
                network: networkCode,
                capacity: Number(capacity),
                price: Number(price) || 0,
                costPrice: Number(costPrice) || 0,
                profit: (Number(price) || 0) - (Number(costPrice) || 0),
                status: 'failed',
                paymentMethod: 'datamart',
                customerPhone: customerPhone || null,
                agentId: agentId || null,
                agentCommission: Number(agentCommission) || 0,
              },
            })
          }
        } catch (dbError) {
          console.error('Failed to save failed order to local DB:', dbError)
        }
      }

      return NextResponse.json(
        {
          error: 'Data bundle purchase failed. Please check your DataMart wallet balance or try again.',
          details: datamartError instanceof Error ? datamartError.message : 'Unknown error',
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('POST /api/datamart/purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to process data bundle purchase' },
      { status: 500 },
    )
  }
}
