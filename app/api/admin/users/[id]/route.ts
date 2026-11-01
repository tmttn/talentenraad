import {type NextRequest, NextResponse} from 'next/server';
import {isAdminEmail, normalizeEmail} from '@lib/auth/admin';
import {guardAdminApi} from '@lib/auth/api-guard';
import {db, users} from '@lib/db';
import {isRole, type Role} from '@lib/db/schema';
import {eq} from 'drizzle-orm';
import {sendInvitationEmail} from '@lib/email/messages';
import {logAudit, createAuditContext} from '@lib/audit';
import {computeDataDiff} from '@lib/audit/helpers';

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const guard = await guardAdminApi();

  if (guard.response) {
    return guard.response;
  }

  const {session} = guard;

  const {id} = await context.params;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    return NextResponse.json({user});
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({error: 'Failed to fetch user'}, {status: 500});
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  const guard = await guardAdminApi();

  if (guard.response) {
    return guard.response;
  }

  const {session} = guard;

  const {id} = await context.params;

  try {
    const body = await request.json() as {
      name?: string;
      role?: string;
      resendInvitation?: boolean;
    };

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    // Handle resend invitation
    if (body.resendInvitation) {
      const [updatedUser] = await db.update(users)
        .set({
          invitedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      // Send invitation email
      try {
        await sendInvitationEmail({
          email: updatedUser.email,
          name: updatedUser.name ?? undefined,
          inviterName: session.user.name ?? session.user.email,
        });
      } catch (error) {
        console.error('Failed to send invitation email:', error);
        return NextResponse.json({
          error: 'Uitnodigingsmail kon niet worden verstuurd. Controleer de SMTP-configuratie.',
        }, {status: 500});
      }

      // Log audit event for resend invitation
      await logAudit({
        actionType: 'update',
        resourceType: 'user',
        resourceId: id,
        dataBefore: {invitedAt: existingUser.invitedAt},
        dataAfter: {invitedAt: updatedUser.invitedAt},
        metadata: {action: 'resend_invitation'},
        context: createAuditContext(request, session),
      });

      return NextResponse.json({success: true, user: updatedUser});
    }

    if (body.role !== undefined && !isRole(body.role)) {
      return NextResponse.json({error: 'Invalid role'}, {status: 400});
    }

    const role: Role = body.role ?? existingUser.role;

    // Prevent removing admin from yourself
    if (normalizeEmail(session.user.email) === existingUser.email && role !== 'admin') {
      return NextResponse.json({error: 'Cannot remove admin from yourself'}, {status: 400});
    }

    // Prevent removing admin from protected admin emails
    if (isAdminEmail(existingUser.email) && role !== 'admin') {
      return NextResponse.json({error: 'Cannot remove admin from protected admin email'}, {status: 400});
    }

    const [updatedUser] = await db.update(users)
      .set({
        name: body.name ?? existingUser.name,
        role,
        isAdmin: role === 'admin',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // Log audit event with before/after diff
    const diff = computeDataDiff(
      {name: existingUser.name, role: existingUser.role},
      {name: updatedUser.name, role: updatedUser.role},
    );
    if (diff.before ?? diff.after) {
      await logAudit({
        actionType: 'update',
        resourceType: 'user',
        resourceId: id,
        dataBefore: diff.before,
        dataAfter: diff.after,
        context: createAuditContext(request, session),
      });
    }

    return NextResponse.json({success: true, user: updatedUser});
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({error: 'Failed to update user'}, {status: 500});
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const guard = await guardAdminApi();

  if (guard.response) {
    return guard.response;
  }

  const {session} = guard;

  const {id} = await context.params;

  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    // Prevent deleting yourself
    if (normalizeEmail(session.user.email) === existingUser.email) {
      return NextResponse.json({error: 'Cannot delete yourself'}, {status: 400});
    }

    // Prevent deleting protected admin emails
    if (isAdminEmail(existingUser.email)) {
      return NextResponse.json({error: 'Cannot delete protected admin email'}, {status: 400});
    }

    await db.delete(users).where(eq(users.id, id));

    // Log audit event
    await logAudit({
      actionType: 'delete',
      resourceType: 'user',
      resourceId: id,
      dataBefore: {
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
      dataAfter: null,
      context: createAuditContext(request, session),
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({error: 'Failed to delete user'}, {status: 500});
  }
}
