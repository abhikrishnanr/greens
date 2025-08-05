import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const service = await prisma.serviceNew.findUnique({
      where: { id },
      include: {
        images: true,
        tiers: {
          include: {
            priceHistory: {
              orderBy: { offerStartDate: 'desc' },
              take: 1,
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const tiers = service.tiers.map((t) => {
      const history = t.priceHistory[0]
      return {
        id: t.id,
        name: t.name,
        actualPrice: history?.actualPrice ?? t.actualPrice,
        offerPrice: history?.offerPrice ?? t.offerPrice,
        duration: t.duration,
      }
    })

      return NextResponse.json({
        id: service.id,
        name: service.name,
        caption: service.caption,
        description: service.description,
        imageUrl: service.imageUrl,
        applicableTo: service.applicableTo,
        images: service.images,
        tiers,
      })
    } catch (err) {
      console.error('/api/services/[id] error:', err)
      return NextResponse.json({ error: 'Failed to load service' }, { status: 500 })
    }
}
