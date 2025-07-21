import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { tierId: string } }) {
  const { tierId } = await params
  const entries = await prisma.serviceTierPriceHistory.findMany({
    where: { tierId },
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: Request, { params }: { params: { tierId: string } }) {
  const { tierId } = await params
  const data = await req.json()
  const entry = await prisma.serviceTierPriceHistory.create({
    data: {
      tierId,
      actualPrice: Number(data.actualPrice),
      offerPrice: data.offerPrice === null || data.offerPrice === undefined ? null : Number(data.offerPrice),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(entry)
}

export async function PUT(req: Request, { params }: { params: { tierId: string } }) {
  const data = await req.json()
  const entry = await prisma.serviceTierPriceHistory.update({
    where: { id: data.id },
    data: {
      actualPrice: Number(data.actualPrice),
      offerPrice: data.offerPrice === null || data.offerPrice === undefined ? null : Number(data.offerPrice),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(entry)
}

export async function DELETE(req: Request, { params }: { params: { tierId: string } }) {
  const { id } = await req.json()
  await prisma.serviceTierPriceHistory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
