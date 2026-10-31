import {NextRequest} from 'next/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const sendContactNotification = vi.fn();
const returning = vi.fn();

vi.mock('@lib/email/messages', () => ({sendContactNotification}));
vi.mock('@lib/recaptcha', () => ({verifyRecaptcha: vi.fn()}));
vi.mock('@lib/db', () => ({
  submissions: {},
  db: {insert: () => ({values: () => ({returning})})},
}));

const makeRequest = () => new NextRequest('http://localhost/api/contact', {
  method: 'POST',
  body: JSON.stringify({name: 'Ouder', email: 'ouder@example.com', message: 'Een bericht van genoeg lengte'}),
});

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendContactNotification.mockReset();
    returning.mockReset().mockResolvedValue([{id: 'sub-1'}]);
  });

  it('keeps the submission and answers normally when the notification mail fails', async () => {
    sendContactNotification.mockRejectedValue(new Error('smtp down'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const {POST} = await import('../../app/api/contact/route');

    const response = await POST(makeRequest());
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });

    expect(response.status).toBe(200);
    expect(error).toHaveBeenCalledWith('Failed to send notification email:', expect.any(Error));
  });

  it('returns the existing error response when saving fails', async () => {
    returning.mockRejectedValue(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const {POST} = await import('../../app/api/contact/route');

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });
});
