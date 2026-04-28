import { prismaClient } from '../../prisma/config';

declare global {
  var prisma: typeof prismaClient;
}

const prisma = globalThis.prisma ?? prismaClient;

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
