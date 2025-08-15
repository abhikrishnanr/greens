import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const staffId = session?.user?.id
  if (!staffId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const [totalBookings, todayBookings, upcoming, revenueTotal, revenueToday] = await prisma.$transaction([
    prisma.booking.count({ where: { staffId } }),
    prisma.booking.count({ where: { staffId, date: today } }),
    prisma.booking.findMany({
      where: { staffId, date: { gte: today } },
      orderBy: [{ date: 'asc' }, { start: 'asc' }],
      take: 5,
      select: { id: true, customer: true, date: true, start: true },
    }),
    prisma.bookingItem.aggregate({ _sum: { price: true }, where: { staffId } }),
    prisma.bookingItem.aggregate({ _sum: { price: true }, where: { staffId, booking: { date: today } } }),
  ])

  return Response.json({
    success: true,
    totalBookings,
    todayBookings,
    upcoming,
    revenue: {
      total: revenueTotal._sum.price ?? 0,
      today: revenueToday._sum.price ?? 0,
    },
  })
}
