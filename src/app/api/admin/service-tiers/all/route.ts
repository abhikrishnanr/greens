import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tiers = await prisma.serviceTier.findMany({
    include: {
      priceHistory: true,
      service: {
        select: {
          name: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const now = new Date()
  const response = tiers.map(t => {
    const current = t.priceHistory.find(ph => {
      const start = ph.startDate
      const end = ph.endDate
      return start <= now && (!end || now < end)
    })
    return {
      id: t.id,
      tierName: t.name,
      serviceName: t.service.name,
      categoryName: t.service.category.name,
      duration: t.duration,
      price: current ? current.offerPrice ?? current.actualPrice : t.actualPrice,
    }
  })

  return NextResponse.json(response)
}
