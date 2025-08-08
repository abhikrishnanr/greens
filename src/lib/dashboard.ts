import { prisma } from '@/lib/prisma'

export interface DashboardData {
  services: number
  branches: number
  staff: {
    total: number
    active: number
    removed: number
  }
  bookings: {
    total: number
    today: number
    upcoming: {
      id: string
      customer: string | null
      date: string
      start: string
      staff: { name: string }
    }[]
  }
  pricing: {
    avgActualPrice: number
    avgOfferPrice: number | null
    activeOffers: number
  }
  customers: number
  revenue: {
    total: number
    today: number
    gstTotal: number
    gstToday: number
  }
  enquiries: {
    today: number
    open: number
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = new Date().toISOString().split('T')[0]
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

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
    revenueSum,
    todayRevenueSum,
    todayEnquiries,
    openEnquiries,
  ] = await prisma.$transaction([
    prisma.service.count(),
    prisma.branch.count(),
    prisma.user.count({ where: { role: { in: ['staff', 'customer_staff'] }, removed: false } }),
    prisma.user.count({ where: { role: { in: ['staff', 'customer_staff'] }, removed: true } }),
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
    prisma.user.count({ where: { role: 'customer', removed: false } }),
    prisma.billing.aggregate({ _sum: { amountAfter: true } }),
    prisma.billing.aggregate({
      _sum: { amountAfter: true },
      where: { createdAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.enquiry.count({
      where: { createdAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.enquiry.count({ where: { status: { not: 'closed' } } }),
  ])

  return {
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
    customers: customersCount,
    revenue: {
      total: revenueSum._sum.amountAfter ?? 0,
      today: todayRevenueSum._sum.amountAfter ?? 0,
      gstTotal: (revenueSum._sum.amountAfter ?? 0) * 0.18,
      gstToday: (todayRevenueSum._sum.amountAfter ?? 0) * 0.18,
    },
    enquiries: {
      today: todayEnquiries,
      open: openEnquiries,
    },
  }
}

