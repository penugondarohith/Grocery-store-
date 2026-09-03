/**
 * Prisma client singleton for use in Next.js API routes.
 * We reference the backend's generated Prisma client directly
 * since the frontend package doesn't run `prisma generate`.
 *
 * Generated types live at: backend/node_modules/.prisma/client
 * The PrismaClient class lives at: backend/node_modules/@prisma/client
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('../../backend/node_modules/@prisma/client') as typeof import('../../backend/node_modules/.prisma/client/default');

type PrismaClientType = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType };

export const prisma: PrismaClientType =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
