import {eq, and, sql} from 'drizzle-orm';
import {db, contentClaps} from './db';

export type ClapsData = {
  contentId: string;
  totalClaps: number;
};

/**
 * Fetch claps for multiple content items
 */
export async function getClapsForContentType(contentType: 'nieuws' | 'activiteit'): Promise<Map<string, number>> {
  const results = await db.select({
    contentId: contentClaps.contentId,
    totalClaps: contentClaps.totalClaps,
  })
    .from(contentClaps)
    .where(eq(contentClaps.contentType, contentType));

  const clapsMap = new Map<string, number>();
  for (const row of results) {
    clapsMap.set(row.contentId, row.totalClaps);
  }

  return clapsMap;
}

/**
 * Fetch claps for a single content item
 */
export async function getClapsForContent(
  contentType: 'nieuws' | 'activiteit',
  contentId: string,
): Promise<number> {
  const [result] = await db.select({
    totalClaps: contentClaps.totalClaps,
  })
    .from(contentClaps)
    .where(and(
      eq(contentClaps.contentType, contentType),
      eq(contentClaps.contentId, contentId),
    ))
    .limit(1);

  return result?.totalClaps ?? 0;
}

/**
 * Get total claps across all content
 */
export async function getTotalClapsStats(): Promise<{
  totalClaps: number;
  newsClaps: number;
  activitiesClaps: number;
  topContent: Array<{contentType: string; contentId: string; totalClaps: number}>;
}> {
  // Get totals by content type
  const totals = await db.select({
    contentType: contentClaps.contentType,
    total: sql<number>`sum(${contentClaps.totalClaps})`.as('total'),
  })
    .from(contentClaps)
    .groupBy(contentClaps.contentType);

  // Get top 5 content by claps
  const topContent = await db.select({
    contentType: contentClaps.contentType,
    contentId: contentClaps.contentId,
    totalClaps: contentClaps.totalClaps,
  })
    .from(contentClaps)
    .orderBy(sql`${contentClaps.totalClaps} DESC`)
    .limit(5);

  let newsClaps = 0;
  let activitiesClaps = 0;

  for (const row of totals) {
    if (row.contentType === 'nieuws') {
      newsClaps = Number(row.total) || 0;
    } else if (row.contentType === 'activiteit') {
      activitiesClaps = Number(row.total) || 0;
    }
  }

  return {
    totalClaps: newsClaps + activitiesClaps,
    newsClaps,
    activitiesClaps,
    topContent,
  };
}
