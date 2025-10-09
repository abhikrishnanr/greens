const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const participant = await prisma.user.upsert({
    where: { email: 'participant@example.com' },
    update: {},
    create: {
      email: 'participant@example.com',
      name: 'Participant User',
      role: 'PARTICIPANT',
    },
  });

  const submission = await prisma.submission.upsert({
    where: {
      userId_type: {
        userId: participant.id,
        type: 'PHOTO',
      },
    },
    update: {
      title: 'Community Garden Photo',
      description: 'A photo submission showing the community garden in bloom.',
      fileUrl: 'https://example.com/submissions/community-garden.jpg',
      fileKey: 'community-garden.jpg',
      mime: 'image/jpeg',
      sizeBytes: 256000,
      status: 'SUBMITTED',
    },
    create: {
      userId: participant.id,
      type: 'PHOTO',
      title: 'Community Garden Photo',
      description: 'A photo submission showing the community garden in bloom.',
      fileUrl: 'https://example.com/submissions/community-garden.jpg',
      fileKey: 'community-garden.jpg',
      mime: 'image/jpeg',
      sizeBytes: 256000,
      status: 'SUBMITTED',
    },
  });

  await prisma.review.upsert({
    where: {
      submissionId_level: {
        submissionId: submission.id,
        level: 1,
      },
    },
    update: {
      reviewerId: admin.id,
      decision: 'SELECTED',
      comments: 'Great composition and storytelling.',
      decidedAt: new Date(),
    },
    create: {
      submissionId: submission.id,
      level: 1,
      reviewerId: admin.id,
      decision: 'SELECTED',
      comments: 'Great composition and storytelling.',
      decidedAt: new Date(),
    },
  });

  await prisma.review.upsert({
    where: {
      submissionId_level: {
        submissionId: submission.id,
        level: 2,
      },
    },
    update: {
      reviewerId: admin.id,
      decision: 'PENDING',
      comments: null,
      decidedAt: null,
    },
    create: {
      submissionId: submission.id,
      level: 2,
      reviewerId: admin.id,
      decision: 'PENDING',
      comments: null,
      decidedAt: null,
    },
  });

  console.log('✅ Seed data has been inserted.');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
