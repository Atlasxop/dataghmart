import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/auth/profile — Update user profile (name, phone)
export async function PUT(request: NextRequest) {
  try {
    const userId =
      request.cookies.get('user-id')?.value ||
      request.headers.get('user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, phone } = body

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatarUrl,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

// DELETE /api/auth/profile — Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const userId =
      request.cookies.get('user-id')?.value ||
      request.headers.get('user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete related records first
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { agentProfile: true, orders: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete agent commissions for this user's orders
    if (user.agentProfile) {
      await db.agentCommission.deleteMany({
        where: { agentId: user.agentProfile.id },
      })
      await db.referral.deleteMany({
        where: { agentId: user.agentProfile.id },
      })
      await db.agentProfile.delete({
        where: { userId },
      })
    }

    // Delete wallet transactions
    await db.walletTransaction.deleteMany({
      where: { userId },
    })

    // Delete withdrawal requests
    await db.withdrawalRequest.deleteMany({
      where: { userId },
    })

    // Delete agent commissions on user's orders
    const orderIds = user.orders.map((o) => o.id)
    if (orderIds.length > 0) {
      await db.agentCommission.deleteMany({
        where: { orderId: { in: orderIds } },
      })
    }

    // Delete orders
    await db.dataOrder.deleteMany({
      where: { userId },
    })

    // Delete sign-in logs
    await db.signInLog.deleteMany({
      where: { userId },
    })

    // Finally delete the user
    await db.user.delete({
      where: { id: userId },
    })

    const response = NextResponse.json({ success: true })
    response.cookies.delete('user-id')
    response.cookies.delete('user-email')
    return response
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
