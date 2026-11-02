import {db, submissions} from '@lib/db';
import {sendContactNotification} from '@lib/email/messages';
import {verifyRecaptcha} from '@lib/recaptcha';
import {createRateLimiter, formRateLimit} from '@lib/rate-limit';
import {isValidSubject, validateContact, type ContactErrors, type ContactFields} from '@lib/contact-validation';

export type ContactInput = ContactFields & {
  recaptchaToken?: string | null;
  /** Honeypot: hidden from people, filled in by bots. */
  website?: string;
};

export type ContactResult =
  | {status: 'sent'}
  | {status: 'invalid'; errors: ContactErrors}
  | {status: 'limited'}
  | {status: 'recaptcha'}
  | {status: 'failed'};

const rateLimiter = createRateLimiter(formRateLimit);

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#x27;');
}

/**
 * Handles one contact form submission: spam checks, validation, storing it and mailing the board.
 * The server action calls this; the order of the checks is the same as the old /api/contact route.
 */
export async function submitContact(input: ContactInput, clientIp: string): Promise<ContactResult> {
  // Honeypot: pretend it worked, store nothing
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    console.warn('spam: honeypot');
    return {status: 'sent'};
  }

  if (!rateLimiter.check(clientIp)) {
    return {status: 'limited'};
  }

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return {status: 'invalid', errors};
  }

  // Without JavaScript (or without a site key) there is no token; the honeypot and rate limit still apply
  if (input.recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(input.recaptchaToken);
    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
      return {status: 'recaptcha'};
    }
  }

  const data = {
    name: sanitizeInput(input.name),
    email: sanitizeInput(input.email),
    phone: input.phone?.trim() ? sanitizeInput(input.phone) : null,
    subject: isValidSubject(input.subject) ? input.subject : 'vraag',
    message: sanitizeInput(input.message),
  };

  try {
    const [submission] = await db.insert(submissions).values(data).returning();

    // Mail in the background: a failing mail never loses the stored message
    sendContactNotification({...data, phone: data.phone ?? undefined, submissionId: submission.id}).catch(error => {
      console.error('Failed to send notification email:', error);
    });

    return {status: 'sent'};
  } catch (error) {
    console.error('Contact form error:', error);
    return {status: 'failed'};
  }
}
