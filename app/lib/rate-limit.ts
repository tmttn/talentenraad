type RateLimiterOptions = {
  limit: number;
  windowMs: number;
};

/**
 * In-memory sliding-window rate limiter. The app runs as one long-lived Node process,
 * so process memory is enough; expired keys are pruned periodically to keep it bounded.
 */
export function createRateLimiter({limit, windowMs}: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  const recent = (key: string, now: number) => (hits.get(key) ?? []).filter(time => now - time < windowMs);

  const prune = () => {
    const now = Date.now();
    for (const key of hits.keys()) {
      const remaining = recent(key, now);
      if (remaining.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, remaining);
      }
    }
  };

  const timer = setInterval(prune, windowMs);
  timer.unref();

  return {
    /** Returns true when the request is allowed (and counts it), false when over the limit. */
    check(key: string): boolean {
      const now = Date.now();
      const times = recent(key, now);
      if (times.length >= limit) {
        hits.set(key, times);
        return false;
      }

      times.push(now);
      hits.set(key, times);
      return true;
    },
    size: () => hits.size,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded ?? headers.get('x-real-ip')?.trim() ?? 'unknown';
}

export const rateLimitMessage = 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.';
export const formRateLimit = {limit: 5, windowMs: 10 * 60 * 1000};
