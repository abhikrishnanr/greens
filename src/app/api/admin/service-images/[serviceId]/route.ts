import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { serviceId: string } }) {
  const images = await prisma.serviceImage.findMany({
    where: { serviceId: params.serviceId },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(images)
}

export async function POST(req: Request, { params }: { params: { serviceId: string } }) {
  const data = await req.json()
  const image = await prisma.serviceImage.create({
    data: {
      serviceId: params.serviceId,
      imageUrl: data.imageUrl,
      caption: data.caption || null,
    },
  })
  return NextResponse.json(image)
}

export async function PUT(req: Request, { params }: { params: { serviceId: string } }) {
  const data = await req.json()
  const image = await prisma.serviceImage.update({
    where: { id: data.id },
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption || null,
    },
  })
  return NextResponse.json(image)
}

export async function DELETE(req: Request, { params }: { params: { serviceId: string } }) {
  const { id } = await req.json()
  await prisma.serviceImage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
