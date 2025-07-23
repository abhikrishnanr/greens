import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const now = new Date()
  const services = await prisma.serviceNew.findMany({
    where: { categoryId },
    include: {
      tiers: { include: { priceHistory: true } },
    },
    orderBy: { name: 'asc' },
  })

  const result = services.map(svc => ({
    id: svc.id,
    name: svc.name,
    variants: svc.tiers
      .map(t => {
        const current = t.priceHistory.find(ph => {
          const start = ph.startDate
          const end = ph.endDate
          return start <= now && (!end || end > now)
        })
        return {
          id: t.id,
          name: t.name,
          duration: t.duration,
          currentPrice: current
            ? { actualPrice: current.actualPrice, offerPrice: current.offerPrice }
            : null,
        }
      })
      .filter(v => v.currentPrice !== null),
  }))

  return NextResponse.json(result)
}
