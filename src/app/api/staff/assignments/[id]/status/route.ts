import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

  const { status } = await req.json()
  if (!['completed', 'cancelled'].includes(status)) {
    return Response.json({ success: false, error: 'Invalid status' }, { status: 400 })
  }

  await prisma.booking.update({ where: { id: params.id }, data: { status } })
  return Response.json({ success: true })
}
