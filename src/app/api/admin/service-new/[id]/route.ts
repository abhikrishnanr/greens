import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const service = await prisma.serviceNew.update({
    where: { id: params.id },
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
  await prisma.serviceTier.deleteMany({ where: { serviceId: params.id } })
  await prisma.serviceNew.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
