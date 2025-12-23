import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@lib/auth0';
import {
  getContent, updateContent, deleteContent, publishContent, unpublishContent,
} from '@lib/builder-admin';
import type {BuilderModel} from '@lib/builder-types';
import {logAudit, createAuditContext} from '@lib/audit';
import {computeDataDiff} from '@lib/audit/helpers';

const validModels = new Set<BuilderModel>(['activiteit', 'nieuws', 'aankondiging']);

function isValidModel(model: string): model is BuilderModel {
  return validModels.has(model as BuilderModel);
}

type RouteContext = {
  params: Promise<{model: string; id: string}>;
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

  const {model, id} = await context.params;

  if (!isValidModel(model)) {
    return NextResponse.json({error: 'Invalid model'}, {status: 400});
  }

  try {
    const item = await getContent(model, id);

    if (!item) {
      return NextResponse.json({error: 'Not found'}, {status: 404});
    }

    return NextResponse.json({item});
  } catch (error) {
    console.error(`Error fetching ${model}/${id}:`, error);
    return NextResponse.json(
      {error: 'Failed to fetch content'},
      {status: 500},
    );
  }
}

export async function PUT(
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

  const {model, id} = await context.params;

  if (!isValidModel(model)) {
    return NextResponse.json({error: 'Invalid model'}, {status: 400});
  }

  try {
    // Fetch existing content for before state
    const existingContent = await getContent(model, id);

    const body = await request.json() as {
      data?: Record<string, unknown>;
      publish?: boolean;
      name?: string;
    };

    const result = await updateContent(model, id, body.data ?? {}, {
      publish: body.publish,
      name: body.name,
    });

    // Log audit event with before/after diff
    const diff = computeDataDiff(
      existingContent?.data as Record<string, unknown> | undefined,
      body.data,
    );
    await logAudit({
      actionType: 'update',
      resourceType: `content:${model}`,
      resourceId: id,
      dataBefore: diff.before,
      dataAfter: diff.after,
      metadata: {name: body.name, published: body.publish},
      context: createAuditContext(request, session),
    });

    return NextResponse.json({success: true, id: result.id});
  } catch (error) {
    console.error(`Error updating ${model}/${id}:`, error);
    return NextResponse.json(
      {error: 'Failed to update content'},
      {status: 500},
    );
  }
}

export async function DELETE(
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

  const {model, id} = await context.params;

  if (!isValidModel(model)) {
    return NextResponse.json({error: 'Invalid model'}, {status: 400});
  }

  try {
    // Fetch existing content for audit log
    const existingContent = await getContent(model, id);

    await deleteContent(model, id);

    // Log audit event
    await logAudit({
      actionType: 'delete',
      resourceType: `content:${model}`,
      resourceId: id,
      dataBefore: existingContent?.data as Record<string, unknown> | undefined,
      dataAfter: null,
      metadata: {name: existingContent?.name},
      context: createAuditContext(request, session),
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(`Error deleting ${model}/${id}:`, error);
    return NextResponse.json(
      {error: 'Failed to delete content'},
      {status: 500},
    );
  }
}

export async function PATCH(
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

  const {model, id} = await context.params;

  if (!isValidModel(model)) {
    return NextResponse.json({error: 'Invalid model'}, {status: 400});
  }

  try {
    const body = await request.json() as {action: 'publish' | 'unpublish'};

    if (body.action === 'publish') {
      await publishContent(model, id);

      // Log audit event
      await logAudit({
        actionType: 'publish',
        resourceType: `content:${model}`,
        resourceId: id,
        dataBefore: null,
        dataAfter: null,
        metadata: {action: 'publish'},
        context: createAuditContext(request, session),
      });
    } else if (body.action === 'unpublish') {
      await unpublishContent(model, id);

      // Log audit event
      await logAudit({
        actionType: 'unpublish',
        resourceType: `content:${model}`,
        resourceId: id,
        dataBefore: null,
        dataAfter: null,
        metadata: {action: 'unpublish'},
        context: createAuditContext(request, session),
      });
    } else {
      return NextResponse.json({error: 'Invalid action'}, {status: 400});
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(`Error patching ${model}/${id}:`, error);
    return NextResponse.json(
      {error: 'Failed to update content'},
      {status: 500},
    );
  }
}
