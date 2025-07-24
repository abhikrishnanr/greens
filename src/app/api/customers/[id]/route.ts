import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: { select: { id: true, name: true } } },
    })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    const history = await prisma.billing.findMany({
      where: { customerId: id },
      orderBy: { scheduledAt: 'desc' },
    })
    return NextResponse.json({ success: true, user, history })
  } catch (err) {
    console.error('Error in /api/customers/[id]:', err)
    return NextResponse.json({ success: false, error: 'Failed to load customer' }, { status: 500 })
  }
}
