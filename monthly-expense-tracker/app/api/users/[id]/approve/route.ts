import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth/middleware';
import { approvePendingUser } from '@/lib/auth/service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handler = withAdminAuth(async () => {
    try {
      const result = await approvePendingUser(id);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Approval failed';
      const status = message === 'User not found' ? 404 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  });

  return handler(request);
}
