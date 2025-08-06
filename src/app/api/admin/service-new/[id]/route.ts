import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import slugify from '@/lib/slugify'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const data = await req.json()
  const service = await prisma.serviceNew.update({
    where: { id },
    data: {
      name: data.name,
      slug: slugify(`${data.name} ${data.applicableTo}`),
      caption: data.caption || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      applicableTo: data.applicableTo,
      order: data.order ?? 0,
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
