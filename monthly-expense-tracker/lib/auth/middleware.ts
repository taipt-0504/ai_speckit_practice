import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { cleanExpiredSessions, getSessionByToken } from './session';
import prisma from '@/lib/db/prisma';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

function authError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Middleware to validate JWT token
export function withAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const token = request.cookies.get('auth_token')?.value;

      if (!token) {
        return authError('Unauthorized - No token', 401);
      }

      const payload = verifyToken(token);
      if (!payload) {
        return authError('Unauthorized - Invalid token', 401);
      }

      await cleanExpiredSessions();

      const session = await getSessionByToken(token);
      if (!session || new Date() > session.expiresAt) {
        return authError('Unauthorized - Session expired', 401);
      }

      const req = request as AuthRequest;
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      return handler(req);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      return authError(message, 500);
    }
  };
}

// Middleware to require admin role
export function withAdminAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return withAuth(async (request: AuthRequest) => {
    if (request.user?.role !== 'admin') {
      return authError('Forbidden - Admin access required', 403);
    }

    return handler(request);
  });
}

// Middleware to require active status
export function withActiveUserAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return withAuth(async (request: AuthRequest) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user?.id },
      });

      if (!user || user.status !== 'active') {
        return authError('Forbidden - Account not active', 403);
      }

      return handler(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate account state';
      return authError(message, 500);
    }
  });
}
