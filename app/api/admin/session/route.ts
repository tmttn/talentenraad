import {type NextRequest, NextResponse} from 'next/server';
import {auth0} from '@lib/auth0';

export async function GET(_request: NextRequest) {
	try {
		const session = await auth0.getSession();

		if (!session?.user) {
			return NextResponse.json({valid: false}, {status: 401});
		}

		return NextResponse.json({
			valid: true,
			user: {
				email: session.user.email,
				name: session.user.name,
			},
		});
	} catch {
		return NextResponse.json({valid: false}, {status: 401});
	}
}
