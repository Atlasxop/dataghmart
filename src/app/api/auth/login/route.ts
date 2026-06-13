import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// POST /api/auth/login — Sign In with email + password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    const user = await db.user.findUnique({
      where: { email: trimmedEmail },
      include: { agentProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email. Please create an account first.' }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json({ error: 'This account was created with Google. Please sign in with Google.' }, { status: 400 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 })
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'This account has been suspended. Please contact support.' }, { status: 403 })
    }

    // Update last sign-in
    await db.user.update({
      where: { id: user.id },
      data: {
        lastSignInAt: new Date(),
        signInCount: user.signInCount + 1,
      },
    })

    const response = NextResponse.json({
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
    }, { status: 200 })

    response.cookies.set('user-id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    response.cookies.set('user-email', user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 })
  }
}
