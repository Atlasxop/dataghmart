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

// PUT /api/admin/bundles/[id] — Update a bundle price
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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
      isActive,
    } = body

    const existing = await db.bundlePrice.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (network !== undefined) updateData.network = network
    if (capacity !== undefined) updateData.capacity = Number(capacity)
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice)
    if (retailPrice !== undefined) updateData.retailPrice = Number(retailPrice)
    if (agentRetailPrice !== undefined) updateData.agentRetailPrice = Number(agentRetailPrice)
    if (agentPremiumPrice !== undefined) updateData.agentPremiumPrice = Number(agentPremiumPrice)
    if (agentSuperPrice !== undefined) updateData.agentSuperPrice = Number(agentSuperPrice)
    if (distributorPrice !== undefined) updateData.distributorPrice = Number(distributorPrice)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const bundle = await db.bundlePrice.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json({ bundle })
  } catch (error) {
    console.error('Admin bundles PUT error:', error)
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 })
  }
}

// DELETE /api/admin/bundles/[id] — Delete a bundle price
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.bundlePrice.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    await db.bundlePrice.delete({ where: { id: Number(id) } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin bundles DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 })
  }
}
