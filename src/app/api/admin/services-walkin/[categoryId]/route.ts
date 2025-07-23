import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const services = await prisma.serviceNew.findMany({
    where: { categoryId },
    include: {
      tiers: { include: { priceHistory: true } },
    },
    orderBy: { name: 'asc' },
  })
  const now = new Date()
  const response = services.map(svc => ({
    id: svc.id,
    name: svc.name,
    caption: svc.caption,
    description: svc.description,
    imageUrl: svc.imageUrl,
    variants: svc.tiers.map(t => {
      const current = t.priceHistory.find(ph => ph.startDate <= now && (!ph.endDate || ph.endDate > now))
      return {
        id: t.id,
        name: t.name,
        duration: t.duration ?? 0,
        currentPrice: current
          ? { actualPrice: current.actualPrice, offerPrice: current.offerPrice }
          : null,
      }
    }),
  }))
  return NextResponse.json(response)
}
