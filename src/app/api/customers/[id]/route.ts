import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: { select: { id: true, name: true } } },
    })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    const billingHistory = await prisma.billing.findMany({
      where: { customerId: id },
      orderBy: { scheduledAt: 'desc' },
    })

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
