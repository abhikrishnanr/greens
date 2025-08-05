import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const featured = await prisma.featuredService.findMany({
    include: { service: true },
    orderBy: { order: 'asc' },
  })
  type FeaturedWithService = (typeof featured)[number]
  const grouped: Record<string, FeaturedWithService[]> = { female: [], male: [], children: [] }
  featured.forEach((f) => {
    const gender = (f.applicableTo || f.service.applicableTo) as string
    if (!grouped[gender]) grouped[gender] = []
    grouped[gender].push(f)
  })
  return NextResponse.json(grouped)
}

export async function POST(req: Request) {
  const data = await req.json()
  const created = await prisma.featuredService.create({
    data: {
      serviceId: data.serviceId,
      applicableTo: data.applicableTo,
      order: data.order ?? 0,
    },
    include: { service: true },
  })
  return NextResponse.json(created)
}
