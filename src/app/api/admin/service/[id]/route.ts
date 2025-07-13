import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  const service = await prisma.service.update({
    where: { id },
    data
  });
  return NextResponse.json(service);
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
