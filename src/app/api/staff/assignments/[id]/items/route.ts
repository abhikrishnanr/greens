import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const staffId = session?.user?.id
  if (!staffId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking || booking.staffId !== staffId) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { serviceId, name, price, duration } = await req.json()
  if (!serviceId || !name || typeof price !== 'number' || typeof duration !== 'number') {
    return Response.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  const start = new Date()
  const time = start.toTimeString().slice(0, 5)

  await prisma.bookingItem.create({
    data: { bookingId: params.id, serviceId, name, price, duration, staffId, start: time },
  })

  return Response.json({ success: true })
}
