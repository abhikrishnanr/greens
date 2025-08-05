import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params
  const now = new Date()
    const services = await prisma.serviceNew.findMany({
      where: { categoryId },
      select: {
        id: true,
        name: true,
        caption: true,
        description: true,
        imageUrl: true,
        applicableTo: true,
        tiers: {
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
    orderBy: { name: 'asc' },
  })

    const response = services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      caption: svc.caption,
      description: svc.description,
      imageUrl: svc.imageUrl,
      applicableTo: svc.applicableTo,
      variants: svc.tiers.map((t) => ({
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
  }))

  return NextResponse.json(response)
}
