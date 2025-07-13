import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        servicesNew: {
          include: { tiers: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    const result = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      caption: cat.caption ?? '',
      imageUrl: cat.imageUrl ?? null,
      services: cat.servicesNew.map(svc => {
        const prices = svc.tiers.map(t => t.offerPrice ?? t.actualPrice)
        const min = prices.length ? Math.min(...prices) : null
        return {
          id: svc.id,
          name: svc.name,
          caption: svc.caption ?? '',
          imageUrl: svc.imageUrl ?? null,
          minPrice: min,
        }
      })
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('v2/service-categories error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
