import {randomUUID} from 'node:crypto';
import {type NextRequest, NextResponse} from 'next/server';
import {db, contentClaps, clapSessions} from '@lib/db';
import {eq, and, sql} from 'drizzle-orm';
import {cookies} from 'next/headers';

const MAX_CLAPS_PER_SESSION = 50;
const SESSION_COOKIE_NAME = 'clap_session';

type ClapContentType = 'nieuws' | 'activiteit';

type ClapsRequestBody = {
  contentType: ClapContentType;
  contentId: string;
  count?: number;
};

// Get or create session ID from cookie
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return sessionId;
}

// GET: Get clap counts for content
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = request.nextUrl;
    const contentType = searchParams.get('contentType') as ClapContentType;
    const contentId = searchParams.get('contentId');

    if (!contentType || !contentId) {
      return NextResponse.json(
        {error: 'contentType and contentId are required'},
        {status: 400},
      );
    }

    if (!['nieuws', 'activiteit'].includes(contentType)) {
      return NextResponse.json(
        {error: 'Invalid contentType'},
        {status: 400},
      );
    }

    // Get session ID
    const sessionId = await getSessionId();

    // Get total claps for this content
    const [contentClapRecord] = await db
      .select()
      .from(contentClaps)
      .where(and(
        eq(contentClaps.contentType, contentType),
        eq(contentClaps.contentId, contentId),
      ));

    // Get user's claps for this content
    const [sessionRecord] = await db
      .select()
      .from(clapSessions)
      .where(and(
        eq(clapSessions.sessionId, sessionId),
        eq(clapSessions.contentType, contentType),
        eq(clapSessions.contentId, contentId),
      ));

    return NextResponse.json({
      totalClaps: contentClapRecord?.totalClaps ?? 0,
      userClaps: sessionRecord?.clapCount ?? 0,
      maxClaps: MAX_CLAPS_PER_SESSION,
    });
  } catch (error) {
    console.error('Error getting claps:', error);
    return NextResponse.json(
      {error: 'Failed to get claps'},
      {status: 500},
    );
  }
}

// POST: Add claps
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ClapsRequestBody;

    const {contentType, contentId, count = 1} = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        {error: 'contentType and contentId are required'},
        {status: 400},
      );
    }

    if (!['nieuws', 'activiteit'].includes(contentType)) {
      return NextResponse.json(
        {error: 'Invalid contentType'},
        {status: 400},
      );
    }

    // Validate count
    const clapsToAdd = Math.max(1, Math.min(count, MAX_CLAPS_PER_SESSION));

    // Get session ID
    const sessionId = await getSessionId();

    // Get current session clap count
    const [sessionRecord] = await db
      .select()
      .from(clapSessions)
      .where(and(
        eq(clapSessions.sessionId, sessionId),
        eq(clapSessions.contentType, contentType),
        eq(clapSessions.contentId, contentId),
      ));

    const currentUserClaps = sessionRecord?.clapCount ?? 0;
    const remainingClaps = MAX_CLAPS_PER_SESSION - currentUserClaps;

    if (remainingClaps <= 0) {
      // User has reached max claps, return current state
      const [contentClapRecord] = await db
        .select()
        .from(contentClaps)
        .where(and(
          eq(contentClaps.contentType, contentType),
          eq(contentClaps.contentId, contentId),
        ));

      return NextResponse.json({
        totalClaps: contentClapRecord?.totalClaps ?? 0,
        userClaps: currentUserClaps,
        maxClaps: MAX_CLAPS_PER_SESSION,
        added: 0,
      });
    }

    // Calculate actual claps to add (capped by remaining)
    const actualClapsToAdd = Math.min(clapsToAdd, remainingClaps);

    // Update or insert session record
    if (sessionRecord) {
      await db
        .update(clapSessions)
        .set({
          clapCount: currentUserClaps + actualClapsToAdd,
          updatedAt: new Date(),
        })
        .where(eq(clapSessions.id, sessionRecord.id));
    } else {
      await db.insert(clapSessions).values({
        sessionId,
        contentType,
        contentId,
        clapCount: actualClapsToAdd,
      });
    }

    // Update or insert content claps aggregate
    await db
      .insert(contentClaps)
      .values({
        contentType,
        contentId,
        totalClaps: actualClapsToAdd,
      })
      .onConflictDoUpdate({
        target: [contentClaps.contentType, contentClaps.contentId],
        set: {
          totalClaps: sql`${contentClaps.totalClaps} + ${actualClapsToAdd}`,
          updatedAt: new Date(),
        },
      });

    // Get updated total
    const [updatedContentClaps] = await db
      .select()
      .from(contentClaps)
      .where(and(
        eq(contentClaps.contentType, contentType),
        eq(contentClaps.contentId, contentId),
      ));

    return NextResponse.json({
      totalClaps: updatedContentClaps?.totalClaps ?? actualClapsToAdd,
      userClaps: currentUserClaps + actualClapsToAdd,
      maxClaps: MAX_CLAPS_PER_SESSION,
      added: actualClapsToAdd,
    });
  } catch (error) {
    console.error('Error adding claps:', error);
    return NextResponse.json(
      {error: 'Failed to add claps'},
      {status: 500},
    );
  }
}
