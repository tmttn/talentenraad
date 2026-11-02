import {db, submissions} from '@lib/db';
import {sendContactNotification} from '@lib/email/messages';
import {checkFormToken} from '@lib/form-timing';
import {createPersistentRateLimiter} from '@lib/persistent-rate-limit';
import {formRateLimit} from '@lib/rate-limit';
import {isValidSubject, validateContact, type ContactErrors, type ContactFields} from '@lib/contact-validation';

export const contactFormPurpose = 'contact';

export type ContactInput = ContactFields & {
  /** Signed "shown at" token from the page (see form-timing). */
  formToken?: string | null;
  /** Honeypot: hidden from people, filled in by bots. */
  website?: string;
};

export type ContactResult =
  | {status: 'sent'}
  | {status: 'invalid'; errors: ContactErrors}
  | {status: 'limited'}
  | {status: 'expired'}
  | {status: 'failed'};

const rateLimiter = createPersistentRateLimiter({scope: contactFormPurpose, ...formRateLimit});

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
 * Spam (honeypot filled in, sent faster than a person can type, or a forged token) gets the same
 * answer as a real message, so a bot learns nothing; it is logged without its contents.
 */
export async function submitContact(input: ContactInput, clientIp: string): Promise<ContactResult> {
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

  // After validation, so a person who sends an empty form quickly still sees what is missing
  const timing = checkFormToken(contactFormPurpose, input.formToken);
  if (timing === 'too-fast' || timing === 'invalid') {
    console.warn(`spam: form timing (${timing})`);
    return {status: 'sent'};
  }

  if (timing === 'expired') {
    return {status: 'expired'};
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
