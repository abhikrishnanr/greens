import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [bookings, services, staff, branches] = await Promise.all([
      prisma.booking.count(),
      prisma.service.count(),
      prisma.user.count({ where: { role: 'STAFF', removed: false } }),
      prisma.branch.count(),
    ])
    return NextResponse.json({ bookings, services, staff, branches })
  } catch (err: any) {
    console.error('dashboard api error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
