import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@lib/auth0';

const {BUILDER_PRIVATE_KEY} = process.env;

type SaveRequest = {
  contentId: string;
  model: string;
  fields: Record<string, string>;
};

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!await verifyAdmin(session.user.email)) {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  if (!BUILDER_PRIVATE_KEY) {
    return NextResponse.json({error: 'Builder.io private key not configured'}, {status: 500});
  }

  try {
    const body = await request.json() as SaveRequest;
    const {contentId, model, fields} = body;

    if (!contentId || !model || !fields) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    // First, fetch the current content to get the full data structure
    const getUrl = `https://cdn.builder.io/api/v3/content/${model}/${contentId}?apiKey=${process.env.NEXT_PUBLIC_BUILDER_API_KEY}&cachebust=true`;
    const currentResponse = await fetch(getUrl);

    if (!currentResponse.ok) {
      return NextResponse.json({error: 'Failed to fetch current content'}, {status: 500});
    }

    const currentContent = await currentResponse.json() as {data: Record<string, unknown>};

    // Process fields - parse JSON for blocks field
    const processedFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (key === 'blocks' && typeof value === 'string') {
        try {
          processedFields[key] = JSON.parse(value);
        } catch {
          processedFields[key] = value;
        }
      } else {
        processedFields[key] = value;
      }
    }

    // Merge the new fields into the existing data
    const updatedData = {
      ...currentContent.data,
      ...processedFields,
    };

    // Update the content via Builder.io Write API
    const writeUrl = `https://builder.io/api/v1/write/${model}/${contentId}`;
    const writeResponse = await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        data: updatedData,
        published: 'published', // Keep it published
      }),
    });

    if (!writeResponse.ok) {
      const errorText = await writeResponse.text();
      console.error('Builder.io write error:', errorText);
      return NextResponse.json({error: 'Failed to save to Builder.io'}, {status: 500});
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error saving to Builder.io:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
