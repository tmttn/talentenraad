import {type NextRequest, NextResponse} from 'next/server';
import {readSession, sessionCookieName} from '@lib/auth/session-token';

/**
 * Proxy middleware:
 * 1. Every request: an address with invalid percent-encoding gets a short 400 page, so it never reaches
 *    a route (Next.js answers a valid escape that is not valid UTF-8, like %E0%A4, with a 500). Caddy
 *    already refuses malformed escapes like %A or %ZZ itself (HTTP/1.1: 400, HTTP/2: stream reset).
 * 2. /admin: session check (JWT signature and expiry only; the admin check against the
 *    database happens in getSession() in the protected layout and API routes)
 * 3. /admin: 404 rewrites for unknown admin routes
 *
 * Unknown public URLs get the server-rendered 404 (dynamicParams = false in the routes).
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
  '/admin/bestellingen',
  '/admin/afhalen',
  '/admin/not-found-page', // Target for 404 rewrites
]);

// Admin routes with dynamic segments (e.g., /admin/submissions/[id])
const adminDynamicPatterns = [
  /^\/admin\/submissions\/[\w-]+$/,
  // Content editor: list, new and edit per type (slugs as in app/lib/content-store/paths.ts)
  /^\/admin\/content\/(?:activiteiten|acties|nieuws|team|faq)(?:\/[a-z\d]+(?:-[a-z\d]+)*)?$/,
  // Orders: per sale, one order by number, and the production list
  /^\/admin\/bestellingen\/[a-z\d]+(?:-[a-z\d]+)*(?:\/(?:\d{1,6}|productielijst))?$/,
  // Pickup app: scanner per sale and moment, and the hand-over screen per order token
  /^\/admin\/afhalen\/[a-z\d]+(?:-[a-z\d]+)*\/[a-z\d]+(?:-[a-z\d]+)*(?:\/[\w-]{22})?$/,
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

/** True when every %-escape in the path and query decodes to valid UTF-8. */
export function hasValidPercentEncoding(url: string): boolean {
  // Raw path and query as sent: URL keeps the escapes, decodeURIComponent checks them
  const {pathname, search} = new URL(url);
  try {
    decodeURIComponent(pathname);
    decodeURIComponent(search.replaceAll('+', ' '));
    return true;
  } catch {
    return false;
  }
}

const badRequestPage = `<!doctype html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ongeldig adres | Talentenraad</title></head>
<body style="margin:0;font-family:system-ui,sans-serif;color:#101828;background:#fff">
<main style="max-width:560px;margin:15vh auto;padding:28px;border:3px solid #000;border-radius:28px;box-shadow:6px 6px 0 #000">
<p style="display:inline-block;margin:0 0 12px;padding:2px 12px;border:2px solid #000;border-radius:9999px;background:#fcb040;font-weight:700;font-size:14px">Foutcode 400</p>
<h1 style="margin:0 0 12px;font-size:36px;line-height:1.05">Dit adres klopt niet</h1>
<p style="margin:0 0 20px;line-height:1.6;color:#364153">Het adres bevat tekens die we niet kunnen lezen. Kijk de link na, of ga naar de startpagina.</p>
<a href="/" style="display:inline-block;padding:12px 20px;border:2.5px solid #000;border-radius:14px;box-shadow:4px 4px 0 #000;background:#d41769;color:#fff;font-weight:700;text-decoration:none">Naar home</a>
</main>
</body>
</html>
`;

export async function proxy(request: NextRequest) {
  if (!hasValidPercentEncoding(request.url)) {
    return new NextResponse(badRequestPage, {
      status: 400,
      headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'},
    });
  }

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
  // Everything except Next.js build files: the encoding check covers every address
  matcher: ['/((?!_next/static|_next/image).*)'],
};
