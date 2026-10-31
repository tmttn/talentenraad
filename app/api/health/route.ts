import {NextResponse} from 'next/server';
import {sql} from 'drizzle-orm';
import {db} from '@lib/db';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    // Selecting from a table also proves the migrations have been applied.
    db.run(sql`select 1 from users limit 1`);
    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({ok: false}, {status: 503});
  }
}
