import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const host = req.headers.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const now = new Date()
  const tab = await prisma.heroTab.findUnique({
    where: { id },
    include: {
      variants: {
        include: {
          serviceTier: {
            include: {
              service: { include: { category: true } },
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
  if (!tab) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const variants = tab.variants.map((v) => {
    const priceRec = v.serviceTier.priceHistory[0]
    const price =
      priceRec?.offerPrice ??
      priceRec?.actualPrice ??
      v.serviceTier.offerPrice ??
      v.serviceTier.actualPrice
    return {
      id: v.serviceTier.id,
      name: v.serviceTier.name,
      serviceName: v.serviceTier.service.name,
      categoryName: v.serviceTier.service.category.name,
      price,
    }
  })
  const iconUrl = tab.iconUrl && tab.iconUrl.startsWith('/') ? `${base}${tab.iconUrl}` : tab.iconUrl
  const backgroundUrl = tab.backgroundUrl && tab.backgroundUrl.startsWith('/') ? `${base}${tab.backgroundUrl}` : tab.backgroundUrl
  const videoSrc = tab.videoSrc && tab.videoSrc.startsWith('/') ? `${base}${tab.videoSrc}` : tab.videoSrc
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
