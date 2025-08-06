import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all categories with their services and latest price history for each service
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

    // Prepare a neat array of categories with price ranges, image, and caption
    const result = categories.map(cat => {
      // Gather the latest price for each service in this category
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

      // Use the category image, or fall back to the first service image if not set
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

    // Respond with the array
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/service-categories:", err);
    return NextResponse.json([], { status: 500 });
  }
}
