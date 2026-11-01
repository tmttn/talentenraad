import {type NextRequest, NextResponse} from 'next/server';
import {db, submissions} from '@lib/db';
import {sendContactNotification} from '@lib/email/messages';
import {verifyRecaptcha} from '@lib/recaptcha';
import {createRateLimiter, formRateLimit, getClientIp, rateLimitMessage} from '@lib/rate-limit';
import {contactMessages, isValidSubject, validateContact} from '@lib/contact-validation';

const rateLimiter = createRateLimiter(formRateLimit);

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  recaptchaToken?: string | null;
  website?: string;
};

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
  message: contactMessages.success,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContactFormData;

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

    // Same rules and messages as the form
    const errors = validateContact(body);

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: contactMessages.invalid,
        },
        {status: 400},
      );
    }

    // Verify reCAPTCHA token
    if (body.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(body.recaptchaToken);

      if (!recaptchaResult.success) {
        console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
        return NextResponse.json(
          {
            success: false,
            message: contactMessages.recaptcha,
          },
          {status: 400},
        );
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      phone: body.phone ? sanitizeInput(body.phone) : null,
      subject: isValidSubject(body.subject) ? body.subject : 'vraag',
      message: sanitizeInput(body.message),
    };

    // Save to database
    const [submission] = await db.insert(submissions)
      .values({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
      })
      .returning();

    // Send email notification (non-blocking)
    sendContactNotification({
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone ?? undefined,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      submissionId: submission.id,
    }).catch(error => {
      console.error('Failed to send notification email:', error);
    });

    return NextResponse.json(
      successResponse,
      {status: 200},
    );
  } catch (error) {
    console.error('Contact form error:', error);

    return NextResponse.json(
      {
        success: false,
        message: contactMessages.failed,
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
