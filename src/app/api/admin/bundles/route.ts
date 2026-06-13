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

// GET /api/admin/bundles — List all bundle prices
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bundles = await db.bundlePrice.findMany({
      orderBy: [{ network: 'asc' }, { capacity: 'asc' }],
    })

    return NextResponse.json({ bundles })
  } catch (error) {
    console.error('Admin bundles GET error:', error)
    return NextResponse.json({ bundles: [] })
  }
}

// POST /api/admin/bundles — Create a new bundle price
export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      network,
      capacity,
      basePrice,
      retailPrice,
      agentRetailPrice,
      agentPremiumPrice,
      agentSuperPrice,
      distributorPrice,
    } = body

    if (!network || !capacity || retailPrice === undefined) {
      return NextResponse.json(
        { error: 'Network, capacity, and retail price are required' },
        { status: 400 }
      )
    }

    const bundle = await db.bundlePrice.create({
      data: {
        network,
        capacity: Number(capacity),
        basePrice: Number(basePrice || 0),
        retailPrice: Number(retailPrice),
        agentRetailPrice: Number(agentRetailPrice || 0),
        agentPremiumPrice: Number(agentPremiumPrice || 0),
        agentSuperPrice: Number(agentSuperPrice || 0),
        distributorPrice: Number(distributorPrice || 0),
        isActive: true,
      },
    })

    return NextResponse.json({ bundle }, { status: 201 })
  } catch (error) {
    console.error('Admin bundles POST error:', error)
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 })
  }
}
