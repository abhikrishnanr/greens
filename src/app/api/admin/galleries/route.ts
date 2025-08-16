import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const galleries = await prisma.gallery.findMany({ include: { images: true }, orderBy: { title: 'asc' } })
  return NextResponse.json(galleries)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const gallery = await prisma.gallery.create({ data: { title: data.title } })
  return NextResponse.json(gallery)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const gallery = await prisma.gallery.update({ where: { id: data.id }, data: { title: data.title } })
  return NextResponse.json(gallery)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.gallery.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
