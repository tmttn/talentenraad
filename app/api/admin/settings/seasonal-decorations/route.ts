import {type NextRequest, NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {auth0, isAdminEmail} from '@lib/auth0';
import {
  db, siteSettings, users, type SeasonalDecorationsConfig,
} from '@lib/db';
import {defaultSeasonalConfig} from '@components/seasonal-decorations';
import {logAudit, createAuditContext} from '@lib/audit';
import {computeDataDiff} from '@lib/audit/helpers';

const SEASONAL_DECORATIONS_KEY = 'seasonal_decorations';

async function verifyAdminWithSession() {
  const session = await auth0.getSession();
  if (!session?.user?.email) {
    return {email: null, session: null};
  }

  const email = session.user.email.toLowerCase();
  if (!isAdminEmail(email)) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user?.isAdmin) {
      return {email: null, session: null};
    }
  }

  return {email, session};
}

export async function GET() {
  const {email} = await verifyAdminWithSession();
  if (!email) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, SEASONAL_DECORATIONS_KEY),
    });

    if (setting?.value) {
      return NextResponse.json(setting.value);
    }

    return NextResponse.json(defaultSeasonalConfig);
  } catch {
    return NextResponse.json(defaultSeasonalConfig);
  }
}

export async function PUT(request: NextRequest) {
  const {email, session} = await verifyAdminWithSession();
  if (!email) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const config = await request.json() as SeasonalDecorationsConfig;

    // Validate the config
    if (typeof config.enabled !== 'boolean') {
      return NextResponse.json({error: 'Invalid config: enabled must be a boolean'}, {status: 400});
    }

    // Find the user's ID for tracking who made the change
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Check if setting exists
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, SEASONAL_DECORATIONS_KEY),
    });

    const previousConfig = existing?.value ?? defaultSeasonalConfig;

    if (existing) {
      // Update existing setting
      await db.update(siteSettings)
        .set({
          value: config,
          updatedAt: new Date(),
          updatedBy: user?.id,
        })
        .where(eq(siteSettings.key, SEASONAL_DECORATIONS_KEY));
    } else {
      // Create new setting
      await db.insert(siteSettings).values({
        key: SEASONAL_DECORATIONS_KEY,
        value: config,
        updatedBy: user?.id,
      });
    }

    // Log audit event
    const diff = computeDataDiff(
      previousConfig as Record<string, unknown>,
      config as unknown as Record<string, unknown>,
    );
    await logAudit({
      actionType: 'settings_change',
      resourceType: 'settings:seasonal_decorations',
      resourceId: SEASONAL_DECORATIONS_KEY,
      dataBefore: diff.before,
      dataAfter: diff.after,
      context: createAuditContext(request, session),
    });

    return NextResponse.json({success: true, config});
  } catch (error) {
    console.error('Failed to update seasonal decorations:', error);
    return NextResponse.json({error: 'Failed to update settings'}, {status: 500});
  }
}
