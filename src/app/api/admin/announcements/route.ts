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

export async function GET(request: NextRequest) {
  try {
    const isAdmin = verifyAdminToken(request)

    const where: Record<string, unknown> = {}
    if (!isAdmin) {
      where.isActive = true
    }

    const announcements = await db.announcement.findMany({
      where,
      orderBy: { id: 'desc' },
    })

    const mapped = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      start_date: a.startDate?.toISOString() ?? null,
      end_date: a.endDate?.toISOString() ?? null,
      is_active: a.isActive,
    }))

    return NextResponse.json({ announcements: mapped })
  } catch (error) {
    console.error('Admin announcements GET error:', error)
    return NextResponse.json({ announcements: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: bodyText, startDate, endDate } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        body: bodyText || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    })

    const mapped = {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      start_date: announcement.startDate?.toISOString() ?? null,
      end_date: announcement.endDate?.toISOString() ?? null,
      is_active: announcement.isActive,
    }

    return NextResponse.json({ announcement: mapped }, { status: 201 })
  } catch (error) {
    console.error('Admin announcements POST error:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, body: bodyText, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    const existing = await db.announcement.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (bodyText !== undefined) updateData.body = bodyText
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const announcement = await db.announcement.update({
      where: { id: Number(id) },
      data: updateData,
    })

    const mapped = {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      start_date: announcement.startDate?.toISOString() ?? null,
      end_date: announcement.endDate?.toISOString() ?? null,
      is_active: announcement.isActive,
    }

    return NextResponse.json({ announcement: mapped })
  } catch (error) {
    console.error('Admin announcements PUT error:', error)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    const existing = await db.announcement.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    await db.announcement.delete({ where: { id: Number(id) } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin announcements DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
