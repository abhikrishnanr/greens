import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const entries = await prisma.servicePriceHistory.findMany({
    where: { serviceId },
    orderBy: { offerStartDate: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = await params
  const data = await req.json()
  const entry = await prisma.servicePriceHistory.create({ data: { ...data, serviceId } })
  return NextResponse.json(entry)
}

export async function PUT(req: Request, { params }: { params: { serviceId: string } }) {
  const data = await req.json()
  const entry = await prisma.servicePriceHistory.update({ where: { id: data.id }, data })
  return NextResponse.json(entry)
}

export async function DELETE(req: Request, { params }: { params: { serviceId: string } }) {
  const { id } = await req.json()
  await prisma.servicePriceHistory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
