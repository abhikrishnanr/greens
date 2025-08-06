import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        services: {
          include: {
            priceHistory: {
              orderBy: { startDate: 'desc' },
              take: 1,
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const result = categories.map(cat => {
      // Gather latest prices from all services in this category
      const prices = cat.services
        .map(svc => {
          const ph = svc.priceHistory[0];
          return ph ? (ph.offerPrice ?? ph.actualPrice) : null;
        })
        .filter(val => typeof val === 'number');

      let minPrice = null, maxPrice = null;
      if (prices.length) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }

      // Use category image or fallback to first service image
      const image = cat.imageUrl || cat.services.find(s => s.imageUrl)?.imageUrl || null;

      return {
        id: cat.id,
        name: cat.name,
        caption: cat.caption ?? '',
        image,
        minPrice,
        maxPrice,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/service-categories:", err);
    return NextResponse.json([], { status: 500 });
  }
}
