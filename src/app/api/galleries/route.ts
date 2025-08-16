import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const galleries = await prisma.gallery.findMany({ include: { images: true }, orderBy: { title: 'asc' } })
  return NextResponse.json(galleries)
}
