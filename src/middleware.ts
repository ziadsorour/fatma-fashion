import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROLES = ['admin', 'manager', 'fulfillment', 'product_manager', 'support', 'analyst'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin setup page and setup API without authentication
  if (pathname === '/admin/setup' || pathname.startsWith('/api/admin/setup')) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // For page routes, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fatma-dev-secret');
      const { payload } = await jwtVerify(token, secret);

      if (!payload.role || !ADMIN_ROLES.includes(payload.role as string)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub || payload.id as string || '');
      requestHeaders.set('x-user-role', payload.role as string);
      requestHeaders.set('x-user-email', payload.email as string || '');

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      // Invalid token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account') || pathname.startsWith('/api/account')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fatma-dev-secret');
      const { payload } = await jwtVerify(token, secret);

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub || payload.id as string || '');
      requestHeaders.set('x-user-role', payload.role as string || 'customer');
      requestHeaders.set('x-user-email', payload.email as string || '');

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/account/:path*',
    '/api/account/:path*',
  ],
};
