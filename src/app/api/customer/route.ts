// src/app/api/customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your Prisma client

export async function GET(req: NextRequest) {
  const mobile = req.nextUrl.searchParams.get("mobile");
  if (!mobile) {
    return NextResponse.json({ customer: null });
  }
  // Simulate DB fetch - you can replace with your real prisma query
  // Example: const customer = await prisma.customer.findUnique({ where: { mobile } });
  if (mobile === "9999999999") {
    // Dummy record
    return NextResponse.json({ customer: { name: "Anjali Menon", gender: "Female" } });
  }
  return NextResponse.json({ customer: null });
}
