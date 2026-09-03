/**
 * Prisma client singleton for use in Next.js API routes.
 *
 * Uses a dynamic require so the build doesn't fail when
 * `prisma generate` hasn't been run (e.g. on Vercel without a DB).
 * The admin panel uses localStorage instead of Prisma.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

let PrismaClientConstructor: any;

try {
  PrismaClientConstructor = require('@prisma/client').PrismaClient;
} catch {
  // Prisma client not generated — provide a no-op stub so the build succeeds.
  // API routes that depend on prisma will fail at runtime with a clear error.
  PrismaClientConstructor = class StubPrismaClient {
    constructor() {
      console.warn('[prisma] PrismaClient not available. Run `npx prisma generate` to enable DB features.');
    }
  };
}

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma: any =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
