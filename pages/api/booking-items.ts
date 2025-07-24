import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, staffId, start } = req.body
    try {
      const item = await prisma.bookingItem.update({
        where: { id },
        data: { staffId, start },
      })
      await prisma.booking.update({
        where: { id: item.bookingId },
        data: { staffId: item.staffId, start: item.start },
      })
      return res.status(200).json(item)
    } catch (err) {
      console.error('update booking item error', err)
      return res.status(500).json({ error: 'Failed to update booking item' })
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || req.body.id
    try {
      const item = await prisma.bookingItem.delete({ where: { id } })
      const remaining = await prisma.bookingItem.findMany({ where: { bookingId: item.bookingId } })
      if (remaining.length === 0) {
        await prisma.booking.delete({ where: { id: item.bookingId } })
      } else {
        const first = remaining[0]
        await prisma.booking.update({
          where: { id: item.bookingId },
          data: { staffId: first.staffId, start: first.start },
        })
      }
      return res.status(204).end()
    } catch (err) {
      console.error('delete booking item error', err)
      return res.status(500).json({ error: 'Failed to delete booking item' })
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
