import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    if (!categoryId) {
      return NextResponse.json({ success: false, error: "Missing categoryId" }, { status: 400 });
    }

    // Get all services under this category, with latest price history
    const services = await prisma.service.findMany({
      where: { categoryId, active: true },
      include: {
        priceHistory: {
          orderBy: { startDate: 'desc' },
          take: 1,
        }
      },
      orderBy: { order: 'asc' }
    });

    const response = services.map(s => {
      const price = s.priceHistory[0];
      return {
        id: s.id,
        subCategory: s.subCategory,
        costCategory: s.costCategory,
        caption: s.caption ?? '',
        imageUrl: s.imageUrl ?? null,
        minPrice: price ? (price.offerPrice ?? price.actualPrice) : null,
        maxPrice: price ? (price.offerPrice ?? price.actualPrice) : null,
        // Add other fields as needed
      };
    });

    return NextResponse.json({ success: true, services: response });
  } catch (err) {
    console.error("/api/services/by-category error:", err);
    return NextResponse.json({ success: false, error: "Failed to load services" }, { status: 500 });
  }
}
