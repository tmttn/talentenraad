import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';

const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

type BuilderAsset = {
	id: string;
	name: string;
	url: string;
	meta?: {
		width?: number;
		height?: number;
		kind?: string;
	};
	createdDate: number;
};

type GraphQLResponse = {
	data?: {
		files?: BuilderAsset[];
	};
	errors?: Array<{message: string}>;
};

export async function GET(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!isAdminEmail(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const searchParams = request.nextUrl.searchParams;
	const search = searchParams.get('search') ?? '';
	const limit = Number.parseInt(searchParams.get('limit') ?? '50', 10);

	try {
		// Use Builder.io GraphQL API to fetch assets
		const query = `
			query GetFiles($limit: Int, $search: String) {
				files(limit: $limit, search: $search) {
					id
					name
					url
					meta
					createdDate
				}
			}
		`;

		const response = await fetch('https://builder.io/api/v2/admin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${builderPrivateKey}`,
			},
			body: JSON.stringify({
				query,
				variables: {limit, search: search || undefined},
			}),
		});

		if (!response.ok) {
			throw new Error(`Builder API error: ${response.statusText}`);
		}

		const result = await response.json() as GraphQLResponse;

		if (result.errors) {
			throw new Error(result.errors[0]?.message ?? 'GraphQL error');
		}

		// Filter to only return images
		const assets = (result.data?.files ?? []).filter(asset => {
			const isImage = asset.meta?.kind === 'image'
				|| asset.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
			return isImage;
		});

		return NextResponse.json({assets});
	} catch (error) {
		console.error('Error fetching assets:', error);
		return NextResponse.json(
			{error: 'Failed to fetch assets'},
			{status: 500},
		);
	}
}
