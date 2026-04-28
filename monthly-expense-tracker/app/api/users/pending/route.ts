import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth/middleware';
import { getPendingUsers } from '@/lib/auth/service';

export async function GET(request: NextRequest) {
  const handler = withAdminAuth(async () => {
    const pending_users = await getPendingUsers();
    return NextResponse.json({ pending_users, total: pending_users.length });
  });

  return handler(request);
}
