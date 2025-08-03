import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      servicesNew: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          tiers: {
            orderBy: { name: 'asc' },
            select: {
              id: true,
              name: true,
              duration: true,
              priceHistory: {
                where: {
                  startDate: { lte: now },
                  OR: [{ endDate: null }, { endDate: { gt: now } }],
                },
                orderBy: { startDate: 'desc' },
                take: 1,
                select: { actualPrice: true, offerPrice: true },
              },
            },
          },
        },
      },
    },
  })

  const services = categories.flatMap(cat =>
    cat.servicesNew.map(svc => ({
      id: svc.id,
      name: svc.name,
      categoryId: cat.id,
      categoryName: cat.name,
      variants: svc.tiers.map(t => ({
        id: t.id,
        name: t.name,
        duration: t.duration ?? 0,
        currentPrice: t.priceHistory[0]
          ? {
              actualPrice: t.priceHistory[0].actualPrice,
              offerPrice: t.priceHistory[0].offerPrice,
            }
          : null,
      })),
    })),
  )

  return NextResponse.json(services)
}

