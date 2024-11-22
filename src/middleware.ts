import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the session token from the cookies
  const sessionToken = request.cookies.get('session');

  // If accessing protected routes without a session, redirect to root/login page
  if (!sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing root with a session token, redirect to dashboard
  if (sessionToken && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/deposit', '/dashboard'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    '/',
    '/deposit/:path*',
    '/dashboard/:path*',
    '/api/auth/:path*'
  ],
};