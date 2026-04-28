import prisma from '@/lib/db/prisma';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  status: string;
}

export async function createSession(userId: string, token: string, expiresAt: Date): Promise<any> {
  return prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

export async function getSessionByToken(token: string): Promise<any | null> {
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function deleteSession(token: string): Promise<any> {
  return prisma.session.delete({
    where: { token },
  });
}

export async function deleteUserSessions(userId: string): Promise<any> {
  return prisma.session.deleteMany({
    where: { userId },
  });
}

export async function cleanExpiredSessions(): Promise<any> {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
