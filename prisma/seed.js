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

  // 1. First, collect all unique categories
  const categoriesMap = {};
  for (const row of data) {
    const categoryName = row['Category Name'] || row['Main Category'] || 'Other';
    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = {
        name: categoryName,
        description: row['Category Description'] || null,  // Add this col if you want
        imageUrl: row['Category Image URL'] || null,       // Add this col if you want
      };
    }
  }
  // Upsert all categories and keep a lookup
  const categoryLookup = {};
  for (const cName in categoriesMap) {
    const cat = categoriesMap[cName];
    const created = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      create: cat,
      update: {},
    });
    categoryLookup[cName] = created.id;
  }

  // 2. Get all branch IDs
  const branches = await prisma.branch.findMany({ select: { id: true } });

  // 3. For each service
  for (const row of data) {
    const id = row.service_id;
    const categoryName = row['Category Name'] || row['Main Category'] || 'Other';
    const categoryId = categoryLookup[categoryName];

    // Upsert service
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
        imageUrl: row['Image URL'] || null,
        categoryImageUrl: row['Category Image URL'] || null,
        categoryId: categoryId, // <-- Link to category
      },
      update: {
        // You can update fields here if you want, or keep empty
      }
    });

    // Price history
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

    // Link to all branches
    for (const { id: branchId } of branches) {
      await prisma.branchService.upsert({
        where: { branchId_serviceId: { branchId, serviceId: id } },
        create: { branchId, serviceId: id },
        update: {}
      });
    }

    // Service images (optional, CSV: Image URLs = "https://...,https://...")
    if (row['Image URLs']) {
      const urls = row['Image URLs'].split(',').map(s => s.trim()).filter(Boolean);
      for (const imageUrl of urls) {
        await prisma.serviceImage.create({
          data: {
            imageUrl,
            caption: null,
            serviceId: id,
          }
        });
      }
    }
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
