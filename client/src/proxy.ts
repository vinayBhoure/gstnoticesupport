import { type NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { cookie: `refresh_token=${refreshToken.value}` },
      });

      if (refreshRes.ok) {
        const response = NextResponse.next();
        const setCookieHeader = refreshRes.headers.get('set-cookie');
        if (setCookieHeader) {
          response.headers.set('set-cookie', setCookieHeader);
        }
        return response;
      }
    } catch {
      // Refresh failed — let the request continue; session guard will redirect
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/(admin)/:path*',
  ],
};
