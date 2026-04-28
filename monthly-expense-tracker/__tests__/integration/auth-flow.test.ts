import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  approvePendingUser,
  canUserLogin,
  getPendingUsers,
  loginUser,
  registerUser,
} from '@/lib/auth/service';

type MockUser = {
  id: string;
  email: string;
  password: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type MockSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
};

const users: MockUser[] = [];
const sessions: MockSession[] = [];

vi.mock('@/lib/db/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(async ({ where: { email, id } }) => {
        if (email) return users.find((u) => u.email === email) || null;
        if (id) return users.find((u) => u.id === id) || null;
        return null;
      }),
      findMany: vi.fn(async ({ where }) => {
        if (where?.status) {
          return users.filter((u) => u.status === where.status);
        }
        return users;
      }),
      create: vi.fn(async ({ data }) => {
        const user = {
          id: `u_${users.length + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'user',
          ...data,
        };
        users.push(user);
        return user;
      }),
      update: vi.fn(async ({ where: { id }, data }) => {
        const idx = users.findIndex((u) => u.id === id);
        users[idx] = { ...users[idx], ...data, updatedAt: new Date() };
        return users[idx];
      }),
    },
    session: {
      create: vi.fn(async ({ data }) => {
        sessions.push({ id: `s_${sessions.length + 1}`, ...data });
        return sessions[sessions.length - 1];
      }),
      findUnique: vi.fn(
        async ({ where: { token } }) => sessions.find((s) => s.token === token) || null
      ),
      delete: vi.fn(async ({ where: { token } }) => {
        const idx = sessions.findIndex((s) => s.token === token);
        if (idx >= 0) sessions.splice(idx, 1);
        return { token };
      }),
      deleteMany: vi.fn(async () => ({ count: 0 })),
    },
    $disconnect: vi.fn(),
  },
}));

describe('auth flow integration', () => {
  beforeEach(() => {
    users.length = 0;
    sessions.length = 0;
  });

  it('covers register -> pending blocked -> admin approve -> login success', async () => {
    const registered = await registerUser({
      email: 'new-user@example.com',
      password: 'StrongPass123',
    });

    expect(registered.status).toBe('pending');
    expect(canUserLogin(registered.status)).toBe(false);

    await expect(
      loginUser({ email: 'new-user@example.com', password: 'StrongPass123' })
    ).rejects.toThrow(/pending/i);

    const pendingUsers = await getPendingUsers();
    expect(pendingUsers).toHaveLength(1);
    expect(pendingUsers[0].email).toBe('new-user@example.com');

    const approved = await approvePendingUser(registered.id);
    expect(approved.status).toBe('active');

    const loggedIn = await loginUser({
      email: 'new-user@example.com',
      password: 'StrongPass123',
    });

    expect(loggedIn.user.status).toBe('active');
    expect(loggedIn.token).toBeTruthy();
  });
});
