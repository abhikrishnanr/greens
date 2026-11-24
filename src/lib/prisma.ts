import { PrismaClient } from '@prisma/client';

// Reuse one client for the lifetime of a warm Node/Vercel runtime. Creating a
// client per route/module creates another MySQL connection pool and can exhaust
// the database's connection limit under concurrent requests.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });

globalForPrisma.prisma = prisma;
