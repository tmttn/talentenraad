/**
 * The first x-forwarded-for value is only trustworthy because Caddy is the single public entry
 * point and overwrites any client-supplied X-Forwarded-For (no trusted_proxies configured).
 * Putting a CDN in front would require `trusted_proxies` in the Caddyfile.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headers.get('x-real-ip')?.trim();
  return (forwarded ? forwarded : undefined) ?? (realIp ? realIp : undefined) ?? 'unknown';
}

export const rateLimitMessage = 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.';
export const formRateLimit = {limit: 5, windowMs: 10 * 60 * 1000};
