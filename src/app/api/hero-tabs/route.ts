import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const host = req.headers.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
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
      const iconUrl = t.iconUrl && t.iconUrl.startsWith('/') ? `${base}${t.iconUrl}` : t.iconUrl
      const backgroundUrl = t.backgroundUrl && t.backgroundUrl.startsWith('/') ? `${base}${t.backgroundUrl}` : t.backgroundUrl
      const videoSrc = t.videoSrc && t.videoSrc.startsWith('/') ? `${base}${t.videoSrc}` : t.videoSrc
      return {
        id: t.id,
        name: t.name,
        iconUrl,
        backgroundUrl,
        videoSrc,
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
