import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { serviceId } = params;
  const data = await req.json();
  const service = await prisma.service.update({
    where: { id: serviceId },
    data
  });
  return NextResponse.json(service);
}

export async function DELETE(req, { params }) {
  const { serviceId } = params;
  await prisma.service.delete({ where: { id: serviceId } });
  return NextResponse.json({ success: true });
}
