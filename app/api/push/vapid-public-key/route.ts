import {NextResponse} from 'next/server';

export async function GET() {
	// eslint-disable-next-line n/prefer-global/process
	const publicKey = process.env.VAPID_PUBLIC_KEY;

	if (!publicKey) {
		return NextResponse.json({error: 'VAPID not configured'}, {status: 500});
	}

	return NextResponse.json({publicKey});
}
