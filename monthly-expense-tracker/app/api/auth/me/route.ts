import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { getCurrentUserFromToken } from '@/lib/auth/service';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUserFromToken(token);
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
