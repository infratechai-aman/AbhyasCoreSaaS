import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SECURITY (VULN-05): Edge Route Middleware
 * Prevents unauthenticated users from downloading the JS bundles for protected routes.
 * Relies on lightweight cookies set by the client-side Firebase auth state listener.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('abhyas_admin')?.value === '1';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Dashboard and Test Console Routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/test-console')) {
    const isAuth = request.cookies.get('abhyas_session')?.value === '1';
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/test-console/:path*', '/admin/:path*'],
};
