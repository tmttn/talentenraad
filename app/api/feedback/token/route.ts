import {NextResponse} from 'next/server';
import {issueFormToken} from '@lib/form-timing';

// A fresh token per request: it records when the feedback form was opened
export const dynamic = 'force-dynamic';

/** Timing token for the feedback form, fetched when the form opens (the footer itself is static). */
export function GET() {
  return NextResponse.json({token: issueFormToken('feedback')}, {headers: {'Cache-Control': 'no-store'}});
}
