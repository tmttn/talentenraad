import {getSiteUrl} from '@lib/email/mailer';

/**
 * Absolute URL on the public site for redirects from route handlers.
 * Behind Caddy, `request.nextUrl` is the container's own address (0.0.0.0:3000),
 * so redirects use SITE_URL; only when that is missing do we fall back to the request.
 */
export function publicUrl(path: string, request: {nextUrl: URL}): URL {
  try {
    return new URL(path, `${getSiteUrl()}/`);
  } catch {
    return new URL(path, request.nextUrl);
  }
}
