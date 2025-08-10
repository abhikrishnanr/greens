import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    if (!phone) return Response.json({ bills: [] })

    const entries = await prisma.billing.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    })
    const grouped: Record<string, { id: string; date: string; amount: number }> = {}
    for (const it of entries) {
      const b =
        grouped[it.billId] || {
          id: it.billId,
          date: it.createdAt.toISOString().split('T')[0],
          amount: 0,
        }
      b.amount += it.amountAfter
      grouped[it.billId] = b
    }
    return Response.json({ bills: Object.values(grouped) })
  } catch (err) {
    console.error('Error in /api/customer/bills:', err)
    return Response.json({ bills: [] }, { status: 500 })
  }
}
