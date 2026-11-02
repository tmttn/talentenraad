'use server';

import {headers} from 'next/headers';
import {contactMessages, type ContactErrors} from '@lib/contact-validation';
import {submitContact} from '@lib/contact-submit';
import {getClientIp, rateLimitMessage} from '@lib/rate-limit';

export type ContactValues = {name: string; email: string; phone: string; subject: string; message: string};

export type ContactState = {
  status: 'idle' | 'sent' | 'error';
  /** Message for the whole form (not tied to one field). */
  message?: string;
  errors?: ContactErrors;
  /** What was sent, so a re-rendered form (also without JavaScript) keeps it. */
  values?: ContactValues;
};

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const generalMessages = {
  limited: rateLimitMessage,
  recaptcha: contactMessages.recaptcha,
  failed: contactMessages.failed,
};

export async function sendContact(_previous: ContactState, data: FormData): Promise<ContactState> {
  const values: ContactValues = {
    name: text(data, 'name'),
    email: text(data, 'email'),
    phone: text(data, 'phone'),
    subject: text(data, 'subject'),
    message: text(data, 'message'),
  };

  const token = text(data, 'recaptchaToken');
  const result = await submitContact({
    ...values,
    website: text(data, 'website'),
    recaptchaToken: token === '' ? null : token,
  }, getClientIp(await headers() as unknown as Headers));

  if (result.status === 'sent') {
    return {status: 'sent'};
  }

  if (result.status === 'invalid') {
    return {status: 'error', message: contactMessages.invalid, errors: result.errors, values};
  }

  return {status: 'error', message: generalMessages[result.status], values};
}
