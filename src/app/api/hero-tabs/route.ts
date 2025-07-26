import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function GET(req: NextRequest) {
  const host = req.headers.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const now = new Date()
  const tabs = await prisma.heroTab.findMany({
    orderBy: { order: 'asc' },
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

  const result = tabs.map((t) => {
    const variants = t.variants.map((v) => {
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

    const iconUrl =
      t.iconUrl && t.iconUrl.startsWith('/') ? `${base}${t.iconUrl}` : t.iconUrl
    const backgroundUrl =
      t.backgroundUrl && t.backgroundUrl.startsWith('/')
        ? `${base}${t.backgroundUrl}`
        : t.backgroundUrl
    const videoSrc =
      t.videoSrc && t.videoSrc.startsWith('/') ? `${base}${t.videoSrc}` : t.videoSrc
    const slug = slugify(t.heroTitle)

    return {
      id: t.id,
      name: t.name,
      slug,
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

  return NextResponse.json(result)
}
