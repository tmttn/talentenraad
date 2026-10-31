import {type NextRequest, NextResponse} from 'next/server';
import {auth0} from '@lib/auth0';

/**
 * Proxy middleware that handles:
 * 1. Auth0 authentication
 * 2. 404 rewrites for unknown admin routes
 *
 * Unknown public URLs are handled by notFound() in the routes themselves.
 */

// Valid admin routes (exact paths and patterns)
const validAdminExactPaths = new Set([
  '/admin',
  '/admin/login',
  '/admin/submissions',
  '/admin/notificaties',
  '/admin/gebruikers',
  '/admin/audit-logs',
  '/admin/not-found-page', // Target for 404 rewrites
]);

// Admin routes with dynamic segments (e.g., /admin/submissions/[id])
const adminDynamicPatterns = [
  /^\/admin\/submissions\/[\w-]+$/,
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

  // First, run Auth0 middleware
  const authResponse = await auth0.middleware(request);

  // If Auth0 returned a non-next response (redirect, etc.), return it
  if (authResponse.status !== 200 || authResponse.headers.get('x-middleware-rewrite')) {
    return authResponse;
  }

  // Rewrite unknown admin routes to the admin 404 page
  if (pathname.startsWith('/admin') && !isValidAdminPath(pathname)) {
    const notFoundUrl = new URL('/admin/not-found-page', request.url);
    return NextResponse.rewrite(notFoundUrl, {status: 404});
  }

  return authResponse;
}

export const config = {
  matcher: [
    /*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
