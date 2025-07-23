import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const variants = await prisma.serviceTier.findMany({
    where: { serviceId },
    include: { priceHistory: true },
    orderBy: { name: 'asc' },
  })
  const now = new Date()
  const response = variants.map(t => {
    const current = t.priceHistory.find(ph => {
      const start = ph.startDate
      const end = ph.endDate
      return start <= now && (!end || now < end)
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
  return NextResponse.json(response)
}

export async function POST(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const data = await req.json()
  const variant = await prisma.serviceTier.create({
    data: {
      serviceId,
      name: data.name,
      actualPrice: data.actualPrice !== undefined ? Number(data.actualPrice || 0) : 0,
      offerPrice:
        data.offerPrice === null || data.offerPrice === undefined
          ? null
          : Number(data.offerPrice),
      duration: data.duration ? Number(data.duration) : null,
    },
  })
  if (data.actualPrice !== undefined || data.offerPrice !== undefined) {
    await prisma.serviceTierPriceHistory.create({
      data: {
        tierId: variant.id,
        actualPrice: variant.actualPrice,
        offerPrice: variant.offerPrice,
      },
    })
  }
  return NextResponse.json(variant)
}

export async function PUT(req: Request, { params }: { params: { serviceId: string } }) {
  const data = await req.json()
  const existing = await prisma.serviceTier.findUnique({ where: { id: data.id } })
  const updateData: any = { name: data.name }
  if (data.duration !== undefined) updateData.duration = data.duration ? Number(data.duration) : null
  if (data.actualPrice !== undefined) updateData.actualPrice = Number(data.actualPrice || 0)
  if (data.offerPrice !== undefined) updateData.offerPrice =
    data.offerPrice === null ? null : Number(data.offerPrice)

  const variant = await prisma.serviceTier.update({ where: { id: data.id }, data: updateData })

  if (
    existing &&
    (('actualPrice' in updateData && existing.actualPrice !== variant.actualPrice) ||
      ('offerPrice' in updateData && existing.offerPrice !== variant.offerPrice))
  ) {
    await prisma.serviceTierPriceHistory.create({
      data: {
        tierId: variant.id,
        actualPrice: variant.actualPrice,
        offerPrice: variant.offerPrice,
      },
    })
  }
  return NextResponse.json(variant)
}

export async function DELETE(req: Request, { params }: { params: { serviceId: string } }) {
  const { id } = await req.json()
  await prisma.serviceTier.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
