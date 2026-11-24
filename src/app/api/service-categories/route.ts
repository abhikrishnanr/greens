import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // Fetch the current service catalogue and the active price for each tier.
    const categories = await prisma.serviceCategory.findMany({
      include: {
        servicesNew: {
          include: {
            tiers: {
              include: {
                priceHistory: {
                  where: {
                    startDate: { lte: now },
                    OR: [{ endDate: null }, { endDate: { gt: now } }],
                  },
                  orderBy: { startDate: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Prepare a neat array of categories with price ranges, image, and caption
    const result = categories.map(cat => {
      // Gather the latest price for each service in this category
      const prices = cat.servicesNew
        .flatMap((service) => service.tiers)
        .map((tier) => {
          const price = tier.priceHistory[0];
          return price
            ? (price.offerPrice ?? price.actualPrice)
            : (tier.offerPrice ?? tier.actualPrice);
        })
        .filter(val => typeof val === 'number');

      let minPrice = null, maxPrice = null;
      if (prices.length) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }

      // Use the category image, or fall back to the first service image if not set
      const image = cat.imageUrl || cat.servicesNew.find(s => s.imageUrl)?.imageUrl || null;

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
