import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const TIER_COMMISSION: Record<string, number> = {
  retail: 5,
  premium: 8,
  super: 12,
  distributor: 15,
}

// POST /api/agent/register — Create agent user + AgentProfile
// Free registration — no payment required. Agent gets DataMart API access.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, password, tier } = body

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Please enter your email' }, { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Please enter your phone number' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const validTiers = ['retail', 'premium', 'super', 'distributor']
    const agentTier = validTiers.includes(tier) ? tier : 'retail'

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = fullName.trim()
    const trimmedPhone = phone.trim()

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate API key for premium+ tiers
    const shouldGenerateApiKey = ['premium', 'super', 'distributor'].includes(agentTier)
    const apiKey = shouldGenerateApiKey
      ? `dm_${agentTier}_${crypto.randomBytes(24).toString('hex')}`
      : null

    const commissionRate = TIER_COMMISSION[agentTier] || 5

    // Create User with role='agent' + AgentProfile in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: trimmedEmail,
          fullName: trimmedName,
          phone: trimmedPhone,
          password: hashedPassword,
          role: 'agent',
          signInCount: 1,
          lastSignInAt: new Date(),
        },
      })

      const agentProfile = await tx.agentProfile.create({
        data: {
          userId: user.id,
          tier: agentTier,
          commissionRate,
          apiKey,
          apiEnabled: shouldGenerateApiKey,
          status: 'active',
          kycStatus: 'none',
        },
      })

      return { user, agentProfile }
    })

    // Set cookies
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          phone: result.user.phone,
          role: result.user.role,
          balance: result.user.balance,
        },
        agentProfile: {
          id: result.agentProfile.id,
          tier: result.agentProfile.tier,
          status: result.agentProfile.status,
          commissionRate: result.agentProfile.commissionRate,
        },
      },
      { status: 201 },
    )

    response.cookies.set('user-id', result.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    response.cookies.set('user-email', result.user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Agent registration error:', error)
    return NextResponse.json(
      { error: 'Agent registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
