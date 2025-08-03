import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Group all billing records by phone number since billing primarily
    // references customers via their mobile number.
    const groups = await prisma.billing.groupBy({
      by: ['phone'],
      where: { phone: { not: null } },
      _count: { id: true },
      _sum: { amountAfter: true },
      _min: { paidAt: true, scheduledAt: true, createdAt: true },
      _max: { paidAt: true, scheduledAt: true, createdAt: true },
    })

    const totalCustomers = groups.length

    const returningCustomers = groups.filter(g => {
      const minDate = g._min.paidAt || g._min.scheduledAt || g._min.createdAt
      const maxDate = g._max.paidAt || g._max.scheduledAt || g._max.createdAt
      if (!minDate || !maxDate) return false
      return minDate.toDateString() !== maxDate.toDateString()
    }).length

    const returningPercent = totalCustomers
      ? (returningCustomers / totalCustomers) * 100
      : 0

    const topByServices = [...groups]
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10)

    const topByBills = [...groups]
      .sort((a, b) => (b._sum.amountAfter || 0) - (a._sum.amountAfter || 0))
      .slice(0, 10)

    const phones = Array.from(
      new Set([...topByServices, ...topByBills].map(g => g.phone!))
    )
    const users = await prisma.user.findMany({
      where: { phone: { in: phones } },
      select: { id: true, name: true, phone: true },
    })
    const userMap = new Map(users.map(u => [u.phone!, u]))

    const topServices = topByServices.map(g => {
      const u = userMap.get(g.phone!)
      return {
        id: u?.id ?? g.phone!,
        name: u?.name ?? null,
        phone: g.phone,
        count: g._count.id,
      }
    })

    const topBills = topByBills.map(g => {
      const u = userMap.get(g.phone!)
      return {
        id: u?.id ?? g.phone!,
        name: u?.name ?? null,
        phone: g.phone,
        total: g._sum.amountAfter || 0,
      }
    })

    return Response.json({
      success: true,
      topServices,
      topBills,
      totalCustomers,
      returningCustomers,
      returningPercent,
    })
  } catch (err) {
    console.error('Error in /api/customers/stats:', err)
    return Response.json(
      { success: false, error: 'Failed to load stats' },
      { status: 500 }
    )
  }
}
