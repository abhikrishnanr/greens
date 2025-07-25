import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tabs = await prisma.heroTab.findMany({
    orderBy: { order: 'asc' },
    include: {
      variants: {
        include: {
          serviceTier: {
            include: {
              service: { include: { category: true } },
            },
          },
        },
      },
    },
  })
  const now = new Date()
  const result = await Promise.all(
    tabs.map(async (t) => {
      const variants = await Promise.all(
        t.variants.map(async (v) => {
          const price = await prisma.serviceTierPriceHistory.findFirst({
            where: {
              tierId: v.serviceTierId,
              startDate: { lte: now },
              OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            orderBy: { startDate: 'desc' },
          })
          return {
            id: v.serviceTier.id,
            name: v.serviceTier.name,
            serviceName: v.serviceTier.service.name,
            categoryName: v.serviceTier.service.category.name,
            price:
              price?.offerPrice ?? price?.actualPrice ?? v.serviceTier.offerPrice ?? v.serviceTier.actualPrice,
          }
        })
      )
      return {
        id: t.id,
        name: t.name,
        iconUrl: t.iconUrl,
        backgroundUrl: t.backgroundUrl,
        videoSrc: t.videoSrc,
        heroTitle: t.heroTitle,
        heroDescription: t.heroDescription,
        buttonLabel: t.buttonLabel,
        buttonLink: t.buttonLink,
        order: t.order,
        variants,
      }
    })
  )
  return NextResponse.json(result)
}
