import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { categoryId } = await params;
  const services = await prisma.service.findMany({
    where: { categoryId },
    orderBy: { order: "asc" }
  });
  return NextResponse.json(services);
}

export async function POST(req, { params }) {
  const { categoryId } = await params;
  const data = await req.json();
  const service = await prisma.service.create({
    data: {
      ...data,
      categoryId
    }
  });
  return NextResponse.json(service);
}

// For reordering services
export async function PUT(req, { params }) {
  const { categoryId } = await params;
  const newOrder = await req.json(); // [{id, order}, ...]
  for (const s of newOrder) {
    await prisma.service.update({
      where: { id: s.id },
      data: { order: s.order }
    });
  }
  return NextResponse.json({ success: true });
}
