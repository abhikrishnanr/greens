import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const topByServices = await prisma.billing.groupBy({
      by: ['customerId'],
      where: { customerId: { not: null } },
      _count: { _all: true },
      // Order by the number of billing records per customer
      // Prisma does not support using `_all` in `orderBy`,
      // so we sort by counting a specific column (id),
      // which effectively orders by the total records in each group
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    const topByBills = await prisma.billing.groupBy({
      by: ['customerId'],
      where: { customerId: { not: null } },
      _sum: { amountAfter: true },
      orderBy: { _sum: { amountAfter: 'desc' } },
      take: 10,
    })

    const ids = Array.from(new Set([
      ...topByServices.map(t => t.customerId!),
      ...topByBills.map(t => t.customerId!),
    ]))

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, phone: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const topServices = topByServices.map(t => {
      const u = userMap.get(t.customerId!)!
      return { id: u.id, name: u.name, phone: u.phone, count: t._count._all }
    })

    const topBills = topByBills.map(t => {
      const u = userMap.get(t.customerId!)!
      return { id: u.id, name: u.name, phone: u.phone, total: t._sum.amountAfter || 0 }
    })

    return Response.json({ success: true, topServices, topBills })
  } catch (err) {
    console.error('Error in /api/customers/stats:', err)
    return Response.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}
