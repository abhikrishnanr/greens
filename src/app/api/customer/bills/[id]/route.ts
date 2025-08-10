import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const phone = (session?.user as { phone?: string | null })?.phone
    if (!phone) return Response.json({ bill: null }, { status: 401 })

    const items = await prisma.billing.findMany({
      where: { billId: params.id, phone },
      orderBy: { createdAt: 'asc' },
    })
    if (items.length === 0) return Response.json({ bill: null }, { status: 404 })

    const first = items[0]
    const bill = {
      id: params.id,
      billingName: first.billingName,
      billingAddress: first.billingAddress,
      voucherCode: first.voucherCode,
      paymentMethod: first.paymentMethod,
      paidAt: first.paidAt,
      createdAt: first.createdAt,
      phones: Array.from(new Set(items.map((it) => it.phone).filter(Boolean))) as string[],
      items: items.map((it) => ({
        service: it.service,
        variant: it.variant,
        amountBefore: it.amountBefore,
        amountAfter: it.amountAfter,
      })),
      totalBefore: items.reduce((s, it) => s + it.amountBefore, 0),
      totalAfter: items.reduce((s, it) => s + it.amountAfter, 0),
    }

    return Response.json({ bill })
  } catch (err) {
    console.error('Error in /api/customer/bills/[id]:', err)
    return Response.json({ bill: null }, { status: 500 })
  }
}
