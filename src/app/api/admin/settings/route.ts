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

const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'Dataghmart Data Bundles' },
  { key: 'commission_rate', value: '5' },
  { key: 'retail_commission', value: '5' },
  { key: 'premium_commission', value: '7' },
  { key: 'super_commission', value: '10' },
  { key: 'distributor_commission', value: '15' },
  { key: 'agent_registration_fee', value: '20' },
  { key: 'min_wallet_fund', value: '5' },
  { key: 'support_email', value: 'support@dataghmart.vercel.app' },
]

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    })

    if (settings.length === 0) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const setting = await db.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
