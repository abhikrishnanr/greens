import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')
    const where: any = { role: 'customer' }
    if (branchId) where.branchId = branchId
    const customers = await prisma.user.findMany({
      where,
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })
    return Response.json({ success: true, customers })
  } catch (err) {
    console.error('Error in /api/customers:', err)
    return Response.json({ success: false, error: 'Failed to load customers' }, { status: 500 })
  }
}
