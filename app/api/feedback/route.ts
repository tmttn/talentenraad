import {type NextRequest, NextResponse} from 'next/server';
import {db, feedback} from '@lib/db';
import {checkFormToken, issueFormToken, minimumFillMs} from '@lib/form-timing';
import {createPersistentRateLimiter} from '@lib/persistent-rate-limit';
import {formRateLimit, getClientIp, rateLimitMessage} from '@lib/rate-limit';

// Same purpose string as GET /api/feedback/token signs with
const feedbackFormPurpose = 'feedback';

const rateLimiter = createPersistentRateLimiter({scope: feedbackFormPurpose, ...formRateLimit});

type FeedbackFormData = {
  rating: number;
  comment?: string;
  email?: string;
  pageUrl?: string;
  pageTitle?: string;
  website?: string;
  /** Signed "opened at" token from GET /api/feedback/token. */
  formToken?: string;
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#x27;');
}

const successResponse = {
  success: true,
  message: 'Bedankt voor je feedback!',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackFormData;

    // Honeypot: real visitors never fill this hidden field. Pretend it worked, store nothing.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      console.warn('spam: honeypot');
      return NextResponse.json(successResponse, {status: 200});
    }

    if (!rateLimiter.check(getClientIp(request.headers))) {
      return NextResponse.json(
        {success: false, message: rateLimitMessage},
        {status: 429},
      );
    }

    // Validate required fields
    const errors: Record<string, string> = {};

    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      errors.rating = 'Beoordeling moet tussen 1 en 5 zijn';
    }

    if (body.email?.trim() && !isValidEmail(body.email)) {
      errors.email = 'Ongeldig e-mailadres';
    }

    if (body.comment && body.comment.length > 2000) {
      errors.comment = 'Opmerking mag maximaal 2000 tekens bevatten';
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: 'Validatie mislukt. Controleer de velden.',
        },
        {status: 400},
      );
    }

    // After validation, like the contact form; too fast or forged gets the normal answer but is not stored
    const timing = checkFormToken(feedbackFormPurpose, body.formToken);
    if (timing === 'too-fast' || timing === 'invalid') {
      console.warn(`spam: form timing (${timing})`);
      return NextResponse.json(successResponse, {status: 200});
    }

    if (timing === 'expired') {
      return NextResponse.json(
        {
          success: false,
          message: 'Het formulier stond te lang open. Verstuur je feedback opnieuw.',
          // Dated back by the minimum fill time: this person already filled in the form
          formToken: issueFormToken(feedbackFormPurpose, Date.now() - minimumFillMs),
        },
        {status: 400},
      );
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Sanitize inputs
    const sanitizedData = {
      rating: body.rating,
      comment: body.comment ? sanitizeInput(body.comment) : null,
      email: body.email?.trim() ? sanitizeInput(body.email) : null,
      pageUrl: body.pageUrl ? sanitizeInput(body.pageUrl).slice(0, 500) : null,
      pageTitle: body.pageTitle ? sanitizeInput(body.pageTitle).slice(0, 200) : null,
      userAgent: userAgent?.slice(0, 500),
    };

    // Save to database
    await db.insert(feedback).values({
      rating: sanitizedData.rating,
      comment: sanitizedData.comment,
      email: sanitizedData.email,
      pageUrl: sanitizedData.pageUrl,
      pageTitle: sanitizedData.pageTitle,
      userAgent: sanitizedData.userAgent,
    });

    return NextResponse.json(
      successResponse,
      {status: 200},
    );
  } catch (error) {
    console.error('Feedback submission error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
      },
      {status: 500},
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {message: 'Method not allowed'},
    {status: 405},
  );
}
