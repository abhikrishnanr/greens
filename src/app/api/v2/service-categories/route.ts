import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
  const now = new Date()
  const categories = await prisma.serviceCategory.findMany({
    include: {
      servicesNew: {
        include: { tiers: true },
      },
    },
    orderBy: { order: 'asc' },
  })

  const result = await Promise.all(
    categories.map(async (cat) => {
      const services = await Promise.all(
        cat.servicesNew.map(async (svc) => {
          const records = await Promise.all(
            svc.tiers.map(async (t) => {
              return prisma.serviceTierPriceHistory.findFirst({
                where: {
                  tierId: t.id,
                  startDate: { lte: now },
                  OR: [{ endDate: null }, { endDate: { gt: now } }],
                },
                orderBy: { startDate: 'desc' },
              })
            })
          )
          const offerPrices = records.map((r) => r?.offerPrice ?? null)
          const actualPrices = records.map((r) => r?.actualPrice ?? null)
          const validOffer = offerPrices.filter((p) => p !== null) as number[]
          const validActual = actualPrices.filter((p) => p !== null) as number[]
          const minOffer = validOffer.length ? Math.min(...validOffer) : null
          const minActual = validActual.length ? Math.min(...validActual) : null
          const minPrice = minOffer ?? minActual
          return {
            id: svc.id,
            name: svc.name,
            // use slug when available, otherwise fall back to id so links remain valid
            slug: svc.slug || svc.id,
            caption: svc.caption ?? '',
            imageUrl: svc.imageUrl ?? null,
            minOfferPrice: minOffer,
            minActualPrice: minActual,
            minPrice,
          }
        })
      )
      return {
        id: cat.id,
        name: cat.name,
        caption: cat.caption ?? '',
        imageUrl: cat.imageUrl ?? null,
        services,
      }
    })
  )

    return NextResponse.json(result)
  } catch (err) {
    console.error('v2/service-categories error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
