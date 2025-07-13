import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const today = new Date();

  const services = await prisma.service.findMany({
    where: { active: true },
    include: {
      priceHistory: {
        orderBy: { offerStartDate: 'desc' },
        take: 1,
      },
      category: true,
    },
    orderBy: { order: 'asc' },
  });

  const enriched = services.map(svc => {
    const priceObj = svc.priceHistory[0];
    let tier = null;
    if (svc.id.endsWith('_deluxe')) tier = 'deluxe';
    else if (svc.id.endsWith('_premium')) tier = 'premium';
    else if (svc.id.endsWith('_basic')) tier = 'basic';

    let showOffer = false;
    if (
      priceObj?.offerPrice != null &&
      priceObj.offerStartDate &&
      priceObj.offerEndDate &&
      new Date(priceObj.offerStartDate) <= today &&
      today <= new Date(priceObj.offerEndDate)
    ) {
      showOffer = true;
    }

    return {
      id: svc.id,
      main_service_name: svc.mainServiceName,
      sub_category: svc.subCategory,
      caption: svc.caption,
      description: svc.serviceDescription,
      image_url: svc.imageUrl,
      category_image_url: svc.categoryImageUrl,
      applicable_to: svc.applicableTo,
      tier,
      original_price: priceObj?.actualPrice ?? null,
      offer_price: showOffer ? priceObj?.offerPrice : null,
      // These are for rendering badges, not from DB but for UI
      offer_title: showOffer ? "OFFER" : null,
      offer_desc: showOffer ? "Limited time offer!" : null,
    };
  });

  return NextResponse.json(enriched);
}
