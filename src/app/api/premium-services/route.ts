/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serialize(plan: any) {
  return {
    id: plan.id,
    title: plan.title,
    imageUrl: plan.imageUrl,
    order: plan.order,
    items: plan.items.map((item: any) => {
      const tier = item.serviceTier
      const price = tier.priceHistory[0]
      return {
        id: item.id,
        name: `${tier.service.name} - ${tier.name}`,
        currentPrice: price?.actualPrice ?? 0,
        offerPrice: price?.offerPrice ?? null,
      }
    }),
  }
}

export async function GET() {
  const now = new Date()
  const plans = await prisma.premiumService.findMany({
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          serviceTier: {
            include: {
              service: true,
              priceHistory: {
                where: {
                  startDate: { lte: now },
                  OR: [{ endDate: null }, { endDate: { gt: now } }],
                },
                orderBy: { startDate: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(plans.map(serialize))
}
