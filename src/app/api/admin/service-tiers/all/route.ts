import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tiers = await prisma.serviceTier.findMany({
    include: {
      service: {
        select: {
          name: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const response = tiers.map(t => ({
    id: t.id,
    tierName: t.name,
    serviceName: t.service.name,
    categoryName: t.service.category.name,
  }))

  return NextResponse.json(response)
}
