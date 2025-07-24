import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const tier = await prisma.serviceTier.findUnique({
    where: { id },
    include: {
      service: { include: { category: true } },
    },
  })
  if (!tier) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    id: tier.id,
    name: tier.name,
    service: { name: tier.service.name, category: { name: tier.service.category.name } },
  })
}
