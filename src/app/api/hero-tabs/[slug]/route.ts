import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params
  const host = req.headers.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const now = new Date()
  let tab = await prisma.heroTab.findUnique({
    where: { id: slug },
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
  if (!tab) {
    const tabs = await prisma.heroTab.findMany({
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
    tab = tabs.find((t) => slugify(t.heroTitle) === slug) || null
  }
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
      serviceId: v.serviceTier.service.id,
      name: v.serviceTier.name,
      serviceName: v.serviceTier.service.name,
      categoryName: v.serviceTier.service.category.name,
      caption: v.serviceTier.service.caption ?? null,
      description: v.serviceTier.service.description ?? null,
      imageUrl: v.serviceTier.service.imageUrl ?? null,
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
