import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req, { params }: { params: { id: string } }) {
  const { id } = await params
  try {
    let service = await prisma.serviceNew.findUnique({
      where: { id },
      include: { tiers: true },
    })

    if (!service) {
      const slug = id.toLowerCase().replace(/-/g, ' ')
      service = await prisma.serviceNew.findFirst({
        where: { name: { equals: slug, mode: 'insensitive' } },
        include: { tiers: true },
      })
      if (!service) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    const images = await prisma.serviceImage.findMany({
      where: { serviceId: service.id },
      orderBy: { id: 'asc' },
    })

    const now = new Date()
    const variants = await Promise.all(
      service.tiers.map(async (t) => {
        const current = await prisma.serviceTierPriceHistory.findFirst({
          where: {
            tierId: t.id,
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gt: now } }],
          },
          orderBy: { startDate: 'desc' },
        })
        return {
          id: t.id,
          name: t.name,
          actualPrice: current?.actualPrice ?? t.actualPrice,
          offerPrice: current?.offerPrice ?? t.offerPrice,
          duration: t.duration,
        }
      })
    )

      const result = {
        id: service.id,
        name: service.name,
        caption: service.caption ?? '',
        description: service.description ?? '',
        imageUrl: service.imageUrl ?? null,
        applicableTo: service.applicableTo,
        images: images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          caption: img.caption ?? null,
        })),
        variants,
      }

    return NextResponse.json(result)
  } catch (err) {
    console.error('v2/services/[id] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
