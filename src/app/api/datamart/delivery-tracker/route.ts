import { getDatamartDeliveryTracker, isDatamartConfigured } from '@/lib/datamart'
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
    const { searchParams } = new URL(request.url)
    const publicAccess = searchParams.get('public') === 'true'

    // Allow public access for the tracker page, or admin access with token
    if (!publicAccess && !verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isDatamartConfigured()) {
      return NextResponse.json({
        tracker: {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          checked: 0,
          delivered: 0,
        },
        configured: false,
        scannerStatus: 'idle',
        lastDelivered: null,
      })
    }

    const tracker = await getDatamartDeliveryTracker()
    return NextResponse.json({
      tracker,
      configured: true,
      scannerStatus: 'active',
      lastDelivered: null,
    })
  } catch (error) {
    console.error('GET /api/datamart/delivery-tracker error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DataMart delivery tracker' },
      { status: 500 },
    )
  }
}
