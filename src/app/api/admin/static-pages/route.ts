import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (slug) {
    const page = await prisma.staticPage.findUnique({ where: { slug } })
    return NextResponse.json(page)
  }
  const pages = await prisma.staticPage.findMany()
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const page = await prisma.staticPage.create({ data: { slug: data.slug, title: data.title, content: data.content } })
  return NextResponse.json(page)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  if (!data.slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  const page = await prisma.staticPage.update({ where: { slug: data.slug }, data: { title: data.title, content: data.content } })
  return NextResponse.json(page)
}

export async function DELETE(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  await prisma.staticPage.delete({ where: { slug } })
  return NextResponse.json({ success: true })
}
