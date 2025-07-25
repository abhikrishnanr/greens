import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const tab = await prisma.heroTab.findUnique({
    where: { id },
    include: {
      variants: {
        include: {
          serviceTier: {
            include: { service: { include: { category: true } } },
          },
        },
      },
    },
  })
  if (!tab) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const now = new Date()
  const variants = await Promise.all(
    tab.variants.map(async (v) => {
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
  const iconUrl = tab.iconUrl ?? null
  const backgroundUrl = tab.backgroundUrl ?? null
  const videoSrc = tab.videoSrc ?? null
  return NextResponse.json({
    id: tab.id,
    name: tab.name,
    iconUrl,
    backgroundUrl,
    videoSrc,
    heroTitle: tab.heroTitle,
    heroDescription: tab.heroDescription,
    buttonLabel: tab.buttonLabel,
    buttonLink: tab.buttonLink,
    order: tab.order,
    variants,
  })
}
