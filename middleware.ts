import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SECURITY (VULN-05 + CRIT-03): Edge Route Middleware
 * 
 * Prevents unauthenticated users from downloading the JS bundles for protected routes.
 * Uses lightweight cookies set by the client-side Firebase auth state listener.
 * 
 * NOTE: This is a UI-level gate only. All actual data access is protected
 * by server-side Firebase Admin SDK token verification in API routes.
 * Even if someone bypasses this middleware, they get an empty UI shell with
 * zero data — every API call requires a valid Firebase ID token.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Routes — require both session AND admin cookie
  if (pathname.startsWith('/admin')) {
    const isAuth = request.cookies.get('abhyas_session')?.value === '1';
    const isAdmin = request.cookies.get('abhyas_admin')?.value === '1';
    if (!isAuth || !isAdmin) {
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

  // Protect Institute Portal Routes
  if (pathname.startsWith('/institute')) {
    const isAuth = request.cookies.get('abhyas_session')?.value === '1';
    const isInstitute = request.cookies.get('abhyas_institute')?.value === '1';
    if (!isAuth || !isInstitute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/test-console/:path*', '/admin/:path*', '/institute/:path*'],
};
