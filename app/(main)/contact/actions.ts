'use server';

import {headers} from 'next/headers';
import {contactMessages, type ContactErrors} from '@lib/contact-validation';
import {contactFormPurpose, submitContact} from '@lib/contact-submit';
import {issueFormToken, minimumFillMs} from '@lib/form-timing';
import {getClientIp, rateLimitMessage} from '@lib/rate-limit';

export type ContactValues = {name: string; email: string; phone: string; subject: string; message: string};

export type ContactState = {
  status: 'idle' | 'sent' | 'error';
  /** Message for the whole form (not tied to one field). */
  message?: string;
  errors?: ContactErrors;
  /** What was sent, so a re-rendered form (also without JavaScript) keeps it. */
  values?: ContactValues;
  /** A fresh timing token when the old one ran out (form open longer than a day). */
  formToken?: string;
};

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const generalMessages = {
  limited: rateLimitMessage,
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

  const result = await submitContact({
    ...values,
    website: text(data, 'website'),
    formToken: text(data, 'formToken'),
  }, getClientIp(await headers() as unknown as Headers));

  if (result.status === 'sent') {
    return {status: 'sent'};
  }

  if (result.status === 'invalid') {
    return {status: 'error', message: contactMessages.invalid, errors: result.errors, values};
  }

  if (result.status === 'expired') {
    // Dated back by the minimum fill time: this person already filled in the form and may resend at once
    const formToken = issueFormToken(contactFormPurpose, Date.now() - minimumFillMs);
    return {status: 'error', message: contactMessages.expired, values, formToken};
  }

  return {status: 'error', message: generalMessages[result.status], values};
}
