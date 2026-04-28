export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
} as const;
