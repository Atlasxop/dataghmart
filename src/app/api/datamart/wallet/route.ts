import { getDatamartWalletBalance, isDatamartConfigured } from '@/lib/datamart'
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

    if (!isDatamartConfigured()) {
      return NextResponse.json({
        deposit: { balance: 0, currency: 'GHS' },
        earnings: {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0,
          currency: 'GHS',
        },
        configured: false,
      })
    }

    const balance = await getDatamartWalletBalance()
    return NextResponse.json({ ...balance, configured: true })
  } catch (error) {
    console.error('GET /api/datamart/wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DataMart wallet balance' },
      { status: 500 },
    )
  }
}
