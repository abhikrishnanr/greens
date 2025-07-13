import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const data = await req.json()
  const service = await prisma.serviceNew.update({
    where: { id },
    data: {
      name: data.name,
      caption: data.caption || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    },
  })
  return NextResponse.json(service)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  await prisma.serviceTier.deleteMany({ where: { serviceId: id } })
  await prisma.serviceNew.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
