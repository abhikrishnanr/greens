import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const data = await req.json()
  const img = await prisma.galleryImage.create({ data: { galleryId: data.galleryId, imageUrl: data.imageUrl, caption: data.caption } })
  return NextResponse.json(img)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const img = await prisma.galleryImage.update({ where: { id: data.id }, data: { galleryId: data.galleryId, caption: data.caption } })
  return NextResponse.json(img)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.galleryImage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
