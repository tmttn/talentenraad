import {NextResponse} from 'next/server';
import {getSession} from '@lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({valid: false}, {status: 401});
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch {
    return NextResponse.json({valid: false}, {status: 401});
  }
}
