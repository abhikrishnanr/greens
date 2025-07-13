import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    // Fetch the service by id with latest price
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { offerStartDate: 'desc' },
          take: 1,
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const price = service.priceHistory[0];
    const response = {
      id: service.id,
      main_service_name: service.mainServiceName,
      main_service_name_description: service.mainServiceNameDescription ?? '',
      caption: service.caption ?? '',
      imageUrl: service.imageUrl ?? null,
      minPrice: price ? (price.offerPrice ?? price.actualPrice) : null,
      applicable_to: (service.applicableTo || 'unisex').toLowerCase(),
      description: service.serviceDescription ?? '',
      sub_category: service.subCategory ?? '',
      category_image_url: service.categoryImageUrl ?? '',
      active: service.active,
      // Add any other fields your detail page needs!
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/services/[id] error:", err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
