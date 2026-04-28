import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
const absolutePath = path.resolve(dbPath);

export const prismaClient = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: `file:${absolutePath}`,
  }),
});

export default prismaClient;

// Export for Prisma CLI
export const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
  },
};
