import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';

const builderPrivateKey = process.env.BUILDER_PRIVATE_KEY ?? '';

type BuilderUploadResponse = {
	url: string;
	name?: string;
	id?: string;
};

export async function POST(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!isAdminEmail(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return NextResponse.json({error: 'No file provided'}, {status: 400});
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'},
				{status: 400},
			);
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{error: 'File too large. Maximum size is 10MB'},
				{status: 400},
			);
		}

		// Get file name without extension for the asset name
		const fileName = file.name;
		const assetName = fileName.replace(/\.[^/.]+$/, '');

		// Build upload URL with query parameters
		const uploadUrl = new URL('https://builder.io/api/v1/upload');
		uploadUrl.searchParams.set('name', assetName);
		uploadUrl.searchParams.set('altText', assetName);

		// Get file as ArrayBuffer for binary upload
		const fileBuffer = await file.arrayBuffer();

		const response = await fetch(uploadUrl.toString(), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${builderPrivateKey}`,
				'Content-Type': file.type,
			},
			body: fileBuffer,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Builder upload error:', errorText);
			throw new Error(`Builder API error: ${response.statusText}`);
		}

		const result = await response.json() as BuilderUploadResponse;

		return NextResponse.json({
			success: true,
			url: result.url,
			name: result.name ?? assetName,
			id: result.id,
		});
	} catch (error) {
		console.error('Error uploading asset:', error);
		return NextResponse.json(
			{error: 'Failed to upload asset'},
			{status: 500},
		);
	}
}
