import { ITokenDto } from '@/interface/auth/interfaceAuthLogin';
import { IApiResponse } from '@/interface/common/interfaceApiResponse';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (
    (!accessToken || !isTokenValid(accessToken)) &&
    (!refreshToken || !isTokenValid(refreshToken))
  ) {
    return NextResponse.next();
  }

  if (accessToken && isTokenValid(accessToken)) {
    return NextResponse.next();
  }

  if (refreshToken && isTokenValid(refreshToken)) {
    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/refreshToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (refreshRes.ok) {
        const refreshData: IApiResponse<ITokenDto> = await refreshRes.json();
        if (refreshData.code !== 0) {
          console.error('Refresh response invalid');
          window.location.href = '/mem/login';
          throw new Error('Token refresh failed');
        }

        const newAccessToken = refreshData.data?.accessToken;
        const newRefreshToken = refreshData.data?.refreshToken;

        if (newAccessToken || newRefreshToken) {
          const rewriteResponse = NextResponse.rewrite(request.url);

          // accessToken 설정
          if (newAccessToken) {
            const accessMaxAge = calculateMaxAge(newAccessToken);
            rewriteResponse.cookies.set('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true',
              sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || 'lax') as 'lax' | 'none',
              path: '/',
              maxAge: accessMaxAge,
            });
            console.log(`AccessToken refreshed, maxAge: ${accessMaxAge}s`);
          }

          // refreshToken 설정 (Rotation)
          if (newRefreshToken) {
            const refreshMaxAge = calculateMaxAge(newRefreshToken);
            rewriteResponse.cookies.set('refreshToken', newRefreshToken, {
              httpOnly: true,
              secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true',
              sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || 'lax') as 'lax' | 'none',
              path: '/',
              maxAge: refreshMaxAge,
            });
            console.log(`RefreshToken rotated, maxAge: ${refreshMaxAge}s`);
          }

          return rewriteResponse;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return NextResponse.next();
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function calculateMaxAge(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const maxAge = exp - now;
    return maxAge > 0 ? maxAge : 0;
  } catch (error) {
    console.error('Failed to calculate maxAge:', error);
    return 3600;
  }
}

// Set-Cookie 헤더에서 accessToken과 refreshToken 모두 파싱
function parseTokensFromSetCookie(setCookie: string | null): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (!setCookie) {
    return { accessToken: null, refreshToken: null };
  }

  const accessMatch = setCookie.match(/accessToken=([^;]+)/);
  const refreshMatch = setCookie.match(/refreshToken=([^;]+)/);

  return {
    accessToken: accessMatch ? accessMatch[1] : null,
    refreshToken: refreshMatch ? refreshMatch[1] : null,
  };
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|api|unauthorizedAccess.html|temp_verification.png).*)',
  ],
};
