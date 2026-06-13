import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/auth/session — Get current user session
export async function GET(request: NextRequest) {
  try {
    const userId =
      request.cookies.get('user-id')?.value ||
      request.headers.get('user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { agentProfile: true },
    })

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 })
      response.cookies.delete('user-id')
      response.cookies.delete('user-email')
      return response
    }

    if (user.suspended) {
      const response = NextResponse.json({ error: 'Account suspended' }, { status: 403 })
      response.cookies.delete('user-id')
      response.cookies.delete('user-email')
      return response
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatarUrl,
        balance: user.balance,
        agent_profile: user.agentProfile ? {
          tier: user.agentProfile.tier,
          status: user.agentProfile.status,
          commission_rate: user.agentProfile.commissionRate,
          api_key: user.agentProfile.apiKey,
        } : null,
      },
      source: 'cookie',
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}

// DELETE /api/auth/session — Sign out (clear cookies)
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('user-id')
  response.cookies.delete('user-email')
  return response
}
