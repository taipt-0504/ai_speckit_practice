import { describe, expect, it } from 'vitest';
import { comparePasswords, hashPassword } from '@/lib/auth/hash';
import { generateToken, verifyToken } from '@/lib/auth/jwt';
import { canUserLogin } from '@/lib/auth/service';

describe('auth utilities', () => {
  it('hashes and verifies password correctly', async () => {
    const raw = 'SecurePass123';
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    await expect(comparePasswords(raw, hashed)).resolves.toBe(true);
    await expect(comparePasswords('WrongPass123', hashed)).resolves.toBe(false);
  });

  it('generates and verifies JWT payload', () => {
    const token = generateToken({
      userId: 'u_1',
      email: 'user@example.com',
      role: 'user',
    });

    const payload = verifyToken(token);
    expect(payload).toBeTruthy();
    expect(payload?.userId).toBe('u_1');
    expect(payload?.email).toBe('user@example.com');
  });

  it('rejects invalid JWT', () => {
    const payload = verifyToken('invalid.token.value');
    expect(payload).toBeNull();
  });

  it('enforces account status login rules', () => {
    expect(canUserLogin('active')).toBe(true);
    expect(canUserLogin('pending')).toBe(false);
    expect(canUserLogin('rejected')).toBe(false);
  });
});
