import {type NextRequest, NextResponse} from 'next/server';
import {getSession} from '@lib/auth/session';
import {db, users} from '@lib/db';
import {eq} from 'drizzle-orm';
import {sendInvitationEmail} from '@lib/email/messages';
import {logAudit, createAuditContext} from '@lib/audit';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const allUsers = await db.query.users.findMany({
      orderBy: (users, {desc}) => [desc(users.createdAt)],
    });

    return NextResponse.json({users: allUsers});
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({error: 'Failed to fetch users'}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const body = await request.json() as {
      email: string;
      name?: string;
      isAdmin?: boolean;
    };

    if (!body.email?.trim()) {
      return NextResponse.json({error: 'Email is required'}, {status: 400});
    }

    const email = body.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({error: 'User already exists'}, {status: 400});
    }

    const [newUser] = await db.insert(users).values({
      email,
      name: body.name?.trim() ?? undefined,
      isAdmin: body.isAdmin ?? false,
      invitedAt: new Date(),
    }).returning();

    // Log audit event
    await logAudit({
      actionType: 'create',
      resourceType: 'user',
      resourceId: newUser.id,
      dataBefore: null,
      dataAfter: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
      },
      context: createAuditContext(request, session),
    });

    // Send invitation email
    try {
      await sendInvitationEmail({
        email: newUser.email,
        name: newUser.name ?? undefined,
        inviterName: session.user.name ?? session.user.email,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return NextResponse.json({
        success: true,
        user: newUser,
        warning: 'Gebruiker aangemaakt maar uitnodigingsmail kon niet worden verstuurd. Controleer de SMTP-configuratie.',
      });
    }

    return NextResponse.json({success: true, user: newUser});
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({error: 'Failed to create user'}, {status: 500});
  }
}
