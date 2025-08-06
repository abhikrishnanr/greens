import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const branchId = new URL(req.url).searchParams.get("branchId");
    if (!branchId) {
      return Response.json({ success: false, error: "Missing branchId" }, { status: 400 });
    }

    // Get all service IDs for the branch
    const branchServiceIds = await prisma.branchService.findMany({
      where: { branchId },
      select: { serviceId: true },
    });
    const serviceIds = branchServiceIds.map(b => b.serviceId);

    if (!serviceIds.length) return Response.json({ success: true, services: [] });

    // Fetch services with latest price history
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, active: true },
      include: {
        priceHistory: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      }
    });

    // Map fields (note mainServiceNameDescription, applicableTo, and image by mainCategoryId)
    const response = services.map(s => {
      const price = s.priceHistory[0];
      const mainCategoryId = s.mainCategoryId || s.id; // adjust as per your schema
      return {
        id: s.id,
        mainCategory: s.mainCategory || s.mainServiceName || '',
        mainCategoryId, // for image path
        mainCategoryDescription: s.mainServiceNameDescription || '',
        subCategory: s.subCategory || '',
        costCategory: s.costCategory || '',
        name: s.name || s.mainServiceName || '',
        applicableTo: s.applicableTo || 'Unisex',
        description: s.description || s.serviceDescription || '',
        imageUrl: `/images/main-categories/${mainCategoryId}.jpg`,
        mrp: price?.actualPrice || s.mrp || 0,
        offerPrice: price?.offerPrice ?? null,
        duration: s.duration,
      };
    });

    return Response.json({ success: true, services: response });

  } catch (err) {
    console.error("/api/services error:", err);
    return Response.json({ success: false, error: "Failed to load services" }, { status: 500 });
  }
}
