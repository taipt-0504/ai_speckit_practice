import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { logoutUser } from '@/lib/auth/service';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (token) {
      await logoutUser(token);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
