import prisma from './prisma';

// Database initialization and health check
export async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

export { prisma as default };
export { PrismaClient } from '@prisma/client';
