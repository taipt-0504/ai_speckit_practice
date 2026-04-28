import prisma from '@/lib/db/prisma';
import { comparePasswords, hashPassword } from './hash';
import { generateToken, verifyToken } from './jwt';
import { createSession, deleteSession, getSessionByToken } from './session';
import { LoginSchema, RegisterSchema } from '@/lib/utils/validation';

export type AccountStatus = 'pending' | 'active' | 'rejected';

interface RegisterPayload {
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export function canUserLogin(status: string): boolean {
  return status === 'active';
}

export async function registerUser(payload: RegisterPayload) {
  const parsed = RegisterSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Invalid request body');
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    throw new Error('Email already registered');
  }

  const password = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password,
      role: 'user',
      status: 'pending',
    },
  });

  return {
    id: user.id,
    email: user.email,
    status: user.status,
    message: 'Account created. Awaiting admin approval.',
  };
}

export async function loginUser(payload: LoginPayload) {
  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Invalid request body');
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const matched = await comparePasswords(parsed.data.password, user.password);
  if (!matched) {
    throw new Error('Invalid email or password');
  }

  if (!canUserLogin(user.status)) {
    throw new Error('Account status is pending. Please wait for admin approval.');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createSession(user.id, token, expiresAt);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}

export async function logoutUser(token: string) {
  await deleteSession(token);
  return { message: 'Logged out successfully' };
}

export async function getCurrentUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Unauthorized');
  }

  const session = await getSessionByToken(token);
  if (!session || new Date() > session.expiresAt) {
    throw new Error('Unauthorized');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
  };
}

export async function getPendingUsers() {
  const users = await prisma.user.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    status: u.status,
    created_at: u.createdAt,
  }));
}

export async function approvePendingUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  if (user.status !== 'pending') {
    throw new Error('User is not in pending status');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status: 'active' },
  });

  return {
    id: updated.id,
    email: updated.email,
    status: updated.status,
    message: 'User account approved successfully.',
  };
}

export async function rejectPendingUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  if (user.status !== 'pending') {
    throw new Error('User is not in pending status');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status: 'rejected' },
  });

  return {
    id: updated.id,
    email: updated.email,
    status: updated.status,
    message: 'User account rejected.',
  };
}
