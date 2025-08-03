import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// `params` is a Promise in App Router dynamic routes and must be awaited
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: { select: { id: true, name: true } } },
    })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    // Fetch billing history using phone number when available since
    // billing entries are primarily identified by the customer's mobile
    // number. Fallback to customerId for older records that might use it.
    const billingWhere: { customerId?: string; phone?: string } = {}
    if (user.phone) billingWhere.phone = user.phone
    else billingWhere.customerId = id

    const billingHistory = await prisma.billing.findMany({
      where: billingWhere,
      orderBy: { scheduledAt: 'desc' },
    })

    // Booking history already relies on phone number or name
    const bookingWhere: { phone?: string; customer?: string | null } = {}
    if (user.phone) bookingWhere.phone = user.phone
    else if (user.name) bookingWhere.customer = user.name

    const scheduleHistory = await prisma.booking.findMany({
      where: bookingWhere,
      include: { items: true },
      orderBy: [{ date: 'desc' }, { start: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      user,
      billingHistory,
      scheduleHistory,
    })
  } catch (err) {
    console.error('Error in /api/customers/[id]:', err)
    return NextResponse.json({ success: false, error: 'Failed to load customer' }, { status: 500 })
  }
}
