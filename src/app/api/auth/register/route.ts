import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// POST /api/auth/register — Create Account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, password, role } = body

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Please enter your email' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = fullName.trim()
    const trimmedPhone = phone?.trim() || null
    const userRole = role === 'agent' ? 'agent' : 'customer'

    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 })
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email: trimmedEmail,
        fullName: trimmedName,
        phone: trimmedPhone,
        password: hashedPassword,
        role: userRole,
        signInCount: 1,
        lastSignInAt: new Date(),
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
        agent_profile: null,
      },
    }, { status: 201 })

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
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 500 })
  }
}
