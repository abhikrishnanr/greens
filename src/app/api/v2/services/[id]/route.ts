import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params
  try {
    const service = await prisma.serviceNew.findUnique({
      where: { id },
      include: { tiers: true }
    })

    if (!service) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const result = {
      id: service.id,
      name: service.name,
      caption: service.caption ?? '',
      description: service.description ?? '',
      imageUrl: service.imageUrl ?? null,
      tiers: service.tiers.map(t => ({
        id: t.id,
        name: t.name,
        actualPrice: t.actualPrice,
        offerPrice: t.offerPrice,
        duration: t.duration,
      }))
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('v2/services/[id] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
