import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@/lib/auth0';
import {listContent, createContent} from '@/lib/builder-admin';
import type {BuilderModel} from '@/lib/builder-types';
import {logAudit, createAuditContext} from '@/lib/audit';

const validModels = new Set<BuilderModel>(['activiteit', 'nieuws', 'aankondiging']);

function isValidModel(model: string): model is BuilderModel {
	return validModels.has(model as BuilderModel);
}

type RouteContext = {
	params: Promise<{model: string}>;
};

export async function GET(
	_request: NextRequest,
	context: RouteContext,
) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!await verifyAdmin(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const {model} = await context.params;

	if (!isValidModel(model)) {
		return NextResponse.json({error: 'Invalid model'}, {status: 400});
	}

	try {
		const items = await listContent(model);
		return NextResponse.json({items});
	} catch (error) {
		console.error(`Error listing ${model}:`, error);
		return NextResponse.json(
			{error: 'Failed to fetch content'},
			{status: 500},
		);
	}
}

export async function POST(
	request: NextRequest,
	context: RouteContext,
) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!await verifyAdmin(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const {model} = await context.params;

	if (!isValidModel(model)) {
		return NextResponse.json({error: 'Invalid model'}, {status: 400});
	}

	try {
		const body = await request.json() as {
			data: Record<string, unknown>;
			publish?: boolean;
			name?: string;
		};

		if (!body.data) {
			return NextResponse.json({error: 'Missing data'}, {status: 400});
		}

		const result = await createContent(model, body.data, {
			publish: body.publish ?? true,
			name: body.name,
		});

		// Log audit event
		await logAudit({
			actionType: 'create',
			resourceType: `content:${model}`,
			resourceId: result.id,
			dataBefore: null,
			dataAfter: body.data,
			metadata: {name: body.name, published: body.publish ?? true},
			context: createAuditContext(request, session),
		});

		return NextResponse.json({success: true, id: result.id});
	} catch (error) {
		console.error(`Error creating ${model}:`, error);
		return NextResponse.json(
			{error: 'Failed to create content'},
			{status: 500},
		);
	}
}
