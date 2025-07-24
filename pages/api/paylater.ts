import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const bills = await prisma.billing.findMany({
      where: { paymentMethod: "paylater" },
    });
    const grouped: Record<string, any> = {};
    bills.forEach((it) => {
      const b = grouped[it.billId] || {
        id: it.billId,
        createdAt: it.createdAt,
        paymentMethod: it.paymentMethod,
        billingName: it.billingName,
        phone: it.phone,
        items: [],
        totalAfter: 0,
      };
      b.items.push({
        service: it.service,
        variant: it.variant,
        amountAfter: it.amountAfter,
      });
      b.totalAfter += it.amountAfter;
      grouped[it.billId] = b;
    });
    return res.json(Object.values(grouped));
  }
  if (req.method === "PUT") {
    const { id, paymentMethod, paidAt } = req.body as {
      id: string;
      paymentMethod: string;
      paidAt: string;
    };
    await prisma.billing.updateMany({
      where: { billId: id },
      data: { paymentMethod, paidAt: new Date(paidAt) },
    });
    return res.json({ success: true });
  }
  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
