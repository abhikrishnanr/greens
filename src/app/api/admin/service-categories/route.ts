import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const cats = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" }, // assuming you add `order Int` to your prisma model
    include: {
      services: { orderBy: { order: "asc" } }
    }
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cat = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      caption: data.caption,
      order: data.order ?? 0,
    }
  });
  return NextResponse.json(cat);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const cat = await prisma.serviceCategory.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      caption: data.caption,
      order: data.order,
    }
  });
  return NextResponse.json(cat);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.serviceCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
