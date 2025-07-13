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
          const prices = await Promise.all(
            svc.tiers.map(async (t) => {
              const current = await prisma.serviceTierPriceHistory.findFirst({
                where: {
                  tierId: t.id,
                  startDate: { lte: now },
                  OR: [{ endDate: null }, { endDate: { gt: now } }],
                },
                orderBy: { startDate: 'desc' },
              })
              return current ? current.offerPrice ?? current.actualPrice : null
            })
          )
          const valid = prices.filter((p) => p !== null) as number[]
          const min = valid.length ? Math.min(...valid) : null
          return {
            id: svc.id,
            name: svc.name,
            caption: svc.caption ?? '',
            imageUrl: svc.imageUrl ?? null,
            minPrice: min,
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
