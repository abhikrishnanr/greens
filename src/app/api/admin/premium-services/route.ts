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
        serviceTierId: item.serviceTierId,
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

export async function POST(req: Request) {
  const data = await req.json()
  const now = new Date()
  const created = await prisma.premiumService.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      order: data.order ?? 0,
      items: {
        create: (data.items || []).map(
          (item: { serviceTierId: string }, idx: number) => ({
            serviceTierId: item.serviceTierId,
            order: idx,
          }),
        ),
      },
    },
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
  })
  return NextResponse.json(serialize(created))
}

export async function PUT(req: Request) {
  const data = await req.json()
  const now = new Date()
  const updated = await prisma.premiumService.update({
    where: { id: data.id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      order: data.order ?? 0,
      items: {
        deleteMany: {},
        create: (data.items || []).map(
          (item: { serviceTierId: string }, idx: number) => ({
            serviceTierId: item.serviceTierId,
            order: idx,
          }),
        ),
      },
    },
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
  })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.premiumService.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
