import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { getSessionByToken } from './session';
import { cleanExpiredSessions } from './session';
import prisma from '@/lib/db/prisma';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to validate JWT token
export async function withAuth(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Verify session exists and is not expired
    const session = await getSessionByToken(token);
    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Session expired' },
        { status: 401 }
      );
    }

    // Clean up expired sessions periodically
    await cleanExpiredSessions();

    // Attach user to request
    const req = request as AuthRequest;
    req.user = payload;

    return handler(req);
  };
}

// Middleware to require admin role
export async function withAdminAuth(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return withAuth(async (request: AuthRequest) => {
    if (request.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return handler(request);
  });
}

// Middleware to require active status
export async function withActiveUserAuth(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return withAuth(async (request: AuthRequest) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user?.id },
    });

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Account not active' },
        { status: 403 }
      );
    }

    return handler(request);
  });
}
