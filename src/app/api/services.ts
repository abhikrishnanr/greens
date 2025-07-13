// pages/api/services.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    // Optionally: filter by branchId if passed as query param
    // const branchId = req.query.branchId as string | undefined;
    // const services = await prisma.service.findMany({ where: { branchId, ... } });
    const services = await prisma.service.findMany({
      where: { active: true }, // Add 'active' field to Service if needed
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
}
