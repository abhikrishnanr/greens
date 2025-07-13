// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(__dirname, 'Rate_Chart_with_Main___Service_Descriptions.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true
  });

  // fetch all branch IDs once
  const branches = await prisma.branch.findMany({ select: { id: true } });

  const categoryMap = new Map();
  const serviceMap = new Map();

  for (const row of data) {
    const id = row.service_id;

    const categoryName = row['Main Service Name'];
    let category = categoryMap.get(categoryName);
    if (!category) {
      category = await prisma.serviceCategory.upsert({
        where: { name: categoryName },
        create: {
          name: categoryName,
          description: row['Main Service Name Description'] || null,
        },
        update: {},
      });
      categoryMap.set(categoryName, category);
    }

    const svcKey = `${category.id}-${row['Sub category']}`;
    let svc = serviceMap.get(svcKey);
    if (!svc) {
      svc = await prisma.serviceNew.create({
        data: {
          categoryId: category.id,
          name: row['Sub category'],
          caption: row['Service Description']?.slice(0, 120) || null,
          description: row['Service Description'] || null,
        },
      });
      serviceMap.set(svcKey, svc);
    }

    await prisma.serviceTier.create({
      data: {
        serviceId: svc.id,
        name: row['Cost Category'],
        actualPrice: parseFloat(row['Actual Price'] || '0'),
        offerPrice: row['Offer Price'] ? parseFloat(row['Offer Price']) : null,
        duration: parseInt(row.Duration || '0', 10),
      },
    });
    // 1) Upsert service
    await prisma.service.upsert({
      where: { id },
      create: {
        id,
        applicableTo: row['Applicable to'],
        mainServiceName: row['Main Service Name'],
        mainServiceNameDescription: row['Main Service Name Description'] || null,
        subCategory: row['Sub category'],
        costCategory: row['Cost Category'],
        serviceDescription: row['Service Description'] || null,
        searchTags: row['Search Tags'] || null,
        duration: parseInt(row.Duration || '0', 10),
        active: true,
      },
      update: {}
    });

    // 2) Create price history
    await prisma.servicePriceHistory.create({
      data: {
        id: `${id}-${row['Offer Start Date'] || 'base'}`,
        serviceId: id,
        actualPrice: parseFloat(row['Actual Price'] || '0'),
        offerPrice: row['Offer Price'] ? parseFloat(row['Offer Price']) : null,
        offerStartDate: row['Offer Start Date'] ? new Date(row['Offer Start Date']) : null,
        offerEndDate: row['Offer End Date'] ? new Date(row['Offer End Date']) : null,
      }
    });

    // 3) Link service to all branches (global catalog)
    for (const { id: branchId } of branches) {
      await prisma.branchService.upsert({
        where: { branchId_serviceId: { branchId, serviceId: id } },
        create: { branchId, serviceId: id },
        update: {}
      });
    }
  }

  console.log('✅ Seeding complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
