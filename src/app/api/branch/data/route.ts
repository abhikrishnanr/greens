import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
  }
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['staff', 'customer_staff'] }, branchId: id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    const serviceIds = (
      await prisma.branchService.findMany({
        where: { branchId: id },
        select: { serviceId: true },
      })
    ).map((b) => b.serviceId)

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, services, staff })
  } catch (err: any) {
    console.error('branch data error', err)
    return NextResponse.json(
      { success: false, error: err.message || 'failed' },
      { status: 500 },
    )
  }
}
