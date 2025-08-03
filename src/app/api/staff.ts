// pages/api/staff.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ["staff", "customer_staff"] }, removed: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.json(staff);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
}
