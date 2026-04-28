import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/service';
import { AUTH_COOKIE_EXPIRY, AUTH_COOKIE_NAME } from '@/lib/auth/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginUser(body);

    const response = NextResponse.json(result, { status: 200 });
    response.cookies.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(AUTH_COOKIE_EXPIRY / 1000),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    const status = message.toLowerCase().includes('pending') ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
