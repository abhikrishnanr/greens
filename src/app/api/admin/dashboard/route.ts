import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    // run all queries in parallel and only fetch required fields for speed
    const [
      servicesCount,
      branchesCount,
      activeStaff,
      removedStaff,
      totalBookings,
      todayBookings,
      upcoming,
      priceAvg,
      activeOffers,
      customersCount,
      enquiriesCount,
      revenueSum,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.branch.count(),
      prisma.user.count({
        where: { role: { in: ['staff', 'customer_staff'] }, removed: false },
      }),
      prisma.user.count({
        where: { role: { in: ['staff', 'customer_staff'] }, removed: true },
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { date: today } }),
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
      prisma.serviceTier.aggregate({
        _avg: { actualPrice: true, offerPrice: true },
      }),
      prisma.serviceTier.count({ where: { offerPrice: { not: null } } }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.enquiry.count({ where: { status: 'new' } }),
      prisma.billing.aggregate({ _sum: { amountAfter: true } }),
    ])

    return NextResponse.json({
      services: servicesCount,
      branches: branchesCount,
      staff: {
        total: activeStaff + removedStaff,
        active: activeStaff,
        removed: removedStaff,
      },
      bookings: {
        total: totalBookings,
        today: todayBookings,
        upcoming,
      },
      customers: customersCount,
      enquiries: enquiriesCount,
      revenue: revenueSum._sum.amountAfter ?? 0,
      pricing: {
        avgActualPrice: priceAvg._avg.actualPrice ?? 0,
        avgOfferPrice: priceAvg._avg.offerPrice,
        activeOffers,
      },
    })
  } catch (err: any) {
    console.error('dashboard api error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
