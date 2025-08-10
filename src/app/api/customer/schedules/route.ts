import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    if (!phone) return Response.json({ schedules: [] })

    const bookings = await prisma.booking.findMany({
      where: { phone },
      include: { items: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })
    const schedules = bookings.map((b) => ({
      id: b.id,
      date: b.date,
      service: b.items[0]?.name || '',
    }))
    return Response.json({ schedules })
  } catch (err) {
    console.error('Error in /api/customer/schedules:', err)
    return Response.json({ schedules: [] }, { status: 500 })
  }
}
