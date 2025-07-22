import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const tiers = await prisma.serviceTier.findMany({
    include: {
      service: {
        select: {
          name: true,
          category: { select: { name: true } },
        },
      },
      priceHistory: {
        where: {
          OR: [
            {
              startDate: { lte: now },
              OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            { startDate: { gt: now } },
          ],
        },
        orderBy: { startDate: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  const response = tiers.map(t => {
    const current = t.priceHistory.find(
      p => p.startDate <= now && (!p.endDate || p.endDate > now)
    )
    const upcoming = t.priceHistory.find(p => p.startDate > now)
    return {
      id: t.id,
      tierName: t.name,
      serviceName: t.service.name,
      categoryName: t.service.category.name,
      current,
      upcoming,
    }
  })

  return NextResponse.json(response)
}
