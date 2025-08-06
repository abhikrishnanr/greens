import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const gender = url.searchParams.get('gender') || undefined

  const now = new Date()
  const variants = await prisma.serviceTier.findMany({
    where: gender ? { service: { applicableTo: gender } } : undefined,
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

  const response = variants.map(t => {
    const current = t.priceHistory.find(
      p => p.startDate <= now && (!p.endDate || p.endDate > now)
    )
    const upcoming = t.priceHistory.find(p => p.startDate > now)
    return {
      id: t.id,
      serviceId: t.serviceId,
      variantName: t.name,
      serviceName: t.service.name,
      categoryName: t.service.category.name,
      duration: t.duration,
      current,
      upcoming,
    }
  })

  return NextResponse.json(response)
}
