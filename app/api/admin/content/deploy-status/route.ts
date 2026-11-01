import {NextResponse, type NextRequest} from 'next/server';
import {guardEditorApi} from '@lib/auth/api-guard';
import {latestDeployStatus} from '@lib/content-store/github';

export const dynamic = 'force-dynamic';

export async function GET(request?: NextRequest) {
  const guard = await guardEditorApi();
  if (guard.response) {
    return guard.response;
  }

  const commit = request?.nextUrl.searchParams.get('commit') ?? undefined;
  if (commit !== undefined && !/^[0-9a-f]{40}$/.test(commit)) {
    return NextResponse.json({error: 'Ongeldige invoer'}, {status: 400});
  }

  try {
    const {state} = await latestDeployStatus(commit);
    return NextResponse.json({state});
  } catch {
    return NextResponse.json({state: 'onbekend'});
  }
}
