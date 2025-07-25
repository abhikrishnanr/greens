import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
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
    ] = await prisma.$transaction([
      prisma.service.count(),
      prisma.branch.count(),
      prisma.user.count({ where: { role: 'STAFF', removed: false } }),
      prisma.user.count({ where: { role: 'STAFF', removed: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { date: today } }),
      prisma.booking.findMany({
        where: { date: { gte: today } },
        include: { staff: { select: { name: true } }, items: true },
        orderBy: [{ date: 'asc' }, { start: 'asc' }],
        take: 5,
      }),
      prisma.serviceTier.aggregate({ _avg: { actualPrice: true, offerPrice: true } }),
      prisma.serviceTier.count({ where: { offerPrice: { not: null } } }),
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
