import {createHmac} from 'node:crypto';
import {and, count, eq, gte, lt} from 'drizzle-orm';
import {db, rateLimitHits} from '@lib/db';

type PersistentRateLimiterOptions = {
  /** Which form; limits are counted per scope. */
  scope: string;
  limit: number;
  windowMs: number;
};

// Only a keyed hash of the IP is stored, so the table never holds a readable address
function hashKey(scope: string, key: string): string {
  return createHmac('sha256', process.env.AUTH_SECRET ?? '').update(`rate-limit:${scope}:${key}`).digest('base64url');
}

/**
 * Sliding-window rate limiter kept in SQLite, so a restart or deploy does not reset it.
 * Each check runs in one transaction: drop expired hits, count, and record the new hit when allowed.
 */
export function createPersistentRateLimiter({scope, limit, windowMs}: PersistentRateLimiterOptions) {
  const recentHits = (keyHash: string, since: Date) => db.select({hits: count()}).from(rateLimitHits)
    .where(and(eq(rateLimitHits.scope, scope), eq(rateLimitHits.keyHash, keyHash), gte(rateLimitHits.hitAt, since)))
    .all()[0].hits;

  return {
    /** True when the key is over the limit now; counts nothing (for limits on failures only). */
    isLimited(key: string, now = Date.now()): boolean {
      return recentHits(hashKey(scope, key), new Date(now - windowMs)) >= limit;
    },

    /** Returns true when the request is allowed (and counts it), false when over the limit. */
    check(key: string, now = Date.now()): boolean {
      const keyHash = hashKey(scope, key);
      const since = new Date(now - windowMs);

      return db.transaction(tx => {
        tx.delete(rateLimitHits).where(and(eq(rateLimitHits.scope, scope), lt(rateLimitHits.hitAt, since))).run();
        const [{hits}] = tx.select({hits: count()}).from(rateLimitHits)
          .where(and(eq(rateLimitHits.scope, scope), eq(rateLimitHits.keyHash, keyHash), gte(rateLimitHits.hitAt, since)))
          .all();
        if (hits >= limit) {
          return false;
        }

        tx.insert(rateLimitHits).values({scope, keyHash, hitAt: new Date(now)}).run();
        return true;
      });
    },
  };
}
