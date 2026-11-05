import {NextResponse} from 'next/server';
import {guardEditorApi} from '@lib/auth/api-guard';
import {alleBestellingen} from '@lib/bestellingen/beheer';
import {naarCsv} from '@lib/bestellingen/overzicht';

export const dynamic = 'force-dynamic';

/** CSV of every order of a sale, for the accounts. Admins and editors only. */
export async function GET(_request: Request, {params}: {params: Promise<{actie: string}>}) {
  const guard = await guardEditorApi();
  if (guard.response) {
    return guard.response;
  }

  const {actie} = await params;
  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(actie)) {
    return NextResponse.json({error: 'Not found'}, {status: 404});
  }

  const csv = naarCsv(await alleBestellingen(actie));
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bestellingen-${actie}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
