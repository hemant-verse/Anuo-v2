import { NextResponse } from 'next/server';
import { revokeSession } from '@/server/auth/session.service';
import { failure } from '@/lib/response';
import { clearRefreshCookie, refreshCookieName } from '@/lib/auth-cookies';

export async function POST(request) {
  try {
    await revokeSession(request.cookies.get(refreshCookieName())?.value);
    const response = NextResponse.json({ success: true, data: {} });
    clearRefreshCookie(response);
    return response;
  } catch (error) {
    return failure(error);
  }
}
