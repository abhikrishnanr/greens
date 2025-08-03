import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    // run all queries in parallel and only fetch required fields for speed
    const [
      servicesCount,
      appointmentsToday,
      billedTodayCount,
      billedAmount,
      enquiriesToday,
      openEnquiries,
      pendingBilling,
      upcoming,
    ] = await Promise.all([
      prisma.serviceTierPriceHistory.count({
        where: { endDate: null },
        distinct: ['tierId'],
      }),

      prisma.booking.count({ where: { date: today } }),
      prisma.billing.count({
        where: { paidAt: { gte: start, lt: end } },
      }),
      prisma.billing.aggregate({
        where: { paidAt: { gte: start, lt: end } },
        _sum: { amountAfter: true },
      }),
      prisma.enquiry.count({
        where: { createdAt: { gte: start, lt: end } },
      }),
      prisma.enquiry.count({ where: { status: { in: ['open', 'processing'] } } }),
      prisma.billing.count({
        where: { scheduledAt: { gte: start, lt: end }, paidAt: null },
      }),
      prisma.booking.findMany({
        where: { date: { gte: today } },
        select: {
          id: true,
          customer: true,
          date: true,
          start: true,
          staff: { select: { name: true } },
        },
        orderBy: [{ date: 'asc' }, { start: 'asc' }],
        take: 5,
      }),

    ])

    return NextResponse.json({
      services: servicesCount,
      bookings: {
        today: appointmentsToday,
        upcoming,
      },
      billing: {
        billedToday: billedTodayCount,
        amountToday: billedAmount._sum.amountAfter || 0,
        pending: pendingBilling,
      },
      enquiries: {
        today: enquiriesToday,
        open: openEnquiries,
      },
    })
  } catch (err) {
    console.error('dashboard api error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
