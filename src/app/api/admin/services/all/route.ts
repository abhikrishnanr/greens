import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all services with required details and price
    const services = await prisma.service.findMany({
      include: {
        priceHistory: {
          orderBy: { startDate: 'desc' },
          take: 1,
        }
      },
      orderBy: [{ order: 'asc' }, { mainServiceName: 'asc' }],
    });

    const response = services.map(s => {
      const price = s.priceHistory[0];
      return {
        id: s.id,
        main_service_name: s.mainServiceName,
        main_service_name_description: s.mainServiceNameDescription ?? '',
        caption: s.caption ?? '',
        imageUrl: s.imageUrl ?? null,
        minPrice: price ? (price.offerPrice ?? price.actualPrice) : null,
        applicable_to: (s.applicableTo || 'unisex').toLowerCase(),
        description: s.serviceDescription ?? '',
        sub_category: s.subCategory ?? '',
        category_image_url: s.categoryImageUrl ?? '', // optional, if you use it
        active: s.active, // optional, if you want to filter out inactive ones
      };
    });

    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/services/all error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
