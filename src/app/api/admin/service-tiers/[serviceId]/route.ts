import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const tiers = await prisma.serviceTier.findMany({ where: { serviceId }, orderBy: { name: 'asc' } })
  return NextResponse.json(tiers)
}

export async function POST(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const data = await req.json()
  const tier = await prisma.serviceTier.create({
    data: {
      serviceId,
      name: data.name,
      actualPrice: Number(data.actualPrice || 0),
      offerPrice: data.offerPrice === null || data.offerPrice === undefined ? null : Number(data.offerPrice),
      duration: data.duration ? Number(data.duration) : null,
    },
  })
  await prisma.serviceTierPriceHistory.create({
    data: {
      tierId: tier.id,
      actualPrice: tier.actualPrice,
      offerPrice: tier.offerPrice,
    },
  })
  return NextResponse.json(tier)
}

export async function PUT(req: Request, { params }: { params: { serviceId: string } }) {
  const data = await req.json()
  const existing = await prisma.serviceTier.findUnique({ where: { id: data.id } })
  const tier = await prisma.serviceTier.update({
    where: { id: data.id },
    data: {
      name: data.name,
      actualPrice: Number(data.actualPrice || 0),
      offerPrice: data.offerPrice === null || data.offerPrice === undefined ? null : Number(data.offerPrice),
      duration: data.duration ? Number(data.duration) : null,
    },
  })
  if (existing && (existing.actualPrice !== tier.actualPrice || existing.offerPrice !== tier.offerPrice)) {
    await prisma.serviceTierPriceHistory.create({
      data: {
        tierId: tier.id,
        actualPrice: tier.actualPrice,
        offerPrice: tier.offerPrice,
      },
    })
  }
  return NextResponse.json(tier)
}

export async function DELETE(req: Request, { params }: { params: { serviceId: string } }) {
  const { id } = await req.json()
  await prisma.serviceTier.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
