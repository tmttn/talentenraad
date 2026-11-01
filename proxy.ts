import {type NextRequest, NextResponse} from 'next/server';
import {readSession, sessionCookieName} from '@lib/auth/session-token';

/**
 * Proxy middleware for /admin:
 * 1. Session check (JWT signature and expiry only; the admin check against the
 *    database happens in getSession() in the protected layout and API routes)
 * 2. 404 rewrites for unknown admin routes
 *
 * Unknown public URLs are handled by notFound() in the routes themselves.
 */

// Valid admin routes (exact paths and patterns)
const validAdminExactPaths = new Set([
  '/admin',
  '/admin/login',
  '/admin/submissions',
  '/admin/gebruikers',
  '/admin/audit-logs',
  '/admin/content',
  '/admin/content/aankondiging',
  '/admin/not-found-page', // Target for 404 rewrites
]);

// Admin routes with dynamic segments (e.g., /admin/submissions/[id])
const adminDynamicPatterns = [
  /^\/admin\/submissions\/[\w-]+$/,
  // Content editor: list, new and edit per type (slugs as in app/lib/content-store/paths.ts)
  /^\/admin\/content\/(?:activiteiten|nieuws|team|faq)(?:\/[a-z\d]+(?:-[a-z\d]+)*)?$/,
];

/**
 * Check if an admin path is valid
 */
function isValidAdminPath(pathname: string): boolean {
  // Check exact paths
  if (validAdminExactPaths.has(pathname)) {
    return true;
  }

  // Check dynamic patterns
  return adminDynamicPatterns.some(pattern => pattern.test(pathname));
}

export async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname !== '/admin/login') {
    const session = await readSession(request.cookies.get(sessionCookieName)?.value);

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rewrite unknown admin routes to the admin 404 page
  if (!isValidAdminPath(pathname)) {
    const notFoundUrl = new URL('/admin/not-found-page', request.url);
    return NextResponse.rewrite(notFoundUrl, {status: 404});
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
