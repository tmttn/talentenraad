// @vitest-environment node
import {NextRequest} from 'next/server';
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));
const sendContactNotification = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@lib/email/messages', () => ({sendContactNotification}));
vi.mock('@lib/recaptcha', () => ({verifyRecaptcha: vi.fn()}));
vi.mock('@lib/db', async () => {
  const schema = await import('../../app/lib/db/schema');
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {submissions, feedback} = await import('@lib/db/schema');
const contact = await import('../../app/api/contact/route');
const feedbackRoute = await import('../../app/api/feedback/route');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

let ipCounter = 0;
const newIp = () => `10.0.0.${++ipCounter}`;

const post = (path: string, body: unknown, ip: string) => new NextRequest(`http://localhost${path}`, {
  method: 'POST',
  headers: {'x-forwarded-for': ip},
  body: JSON.stringify(body),
});

const contactBody = {name: 'Ouder', email: 'ouder@example.com', message: 'Een bericht van genoeg lengte'};
const feedbackBody = {rating: 4, comment: 'Mooi'};
const limitMessage = 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.';

beforeEach(() => {
  testDb.reset();
  sendContactNotification.mockClear();
});

afterAll(() => {
  testDb.close();
});

describe('honeypot', () => {
  it('contact: answers like a success but stores and mails nothing', async () => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const real = await contact.POST(post('/api/contact', contactBody, newIp()));
    const realBody = await real.json() as unknown;
    testDb.reset();
    sendContactNotification.mockClear();

    const spam = await contact.POST(post('/api/contact', {...contactBody, website: 'http://spam.example'}, newIp()));

    expect(spam.status).toBe(real.status);
    expect(await spam.json()).toEqual(realBody);
    expect(await testDb.db.select().from(submissions)).toHaveLength(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('spam: honeypot');
    expect(JSON.stringify(log.mock.calls)).not.toContain('spam.example');
  });

  it('feedback: answers like a success but stores nothing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const real = await feedbackRoute.POST(post('/api/feedback', feedbackBody, newIp()));
    const realBody = await real.json() as unknown;
    testDb.reset();

    const spam = await feedbackRoute.POST(post('/api/feedback', {...feedbackBody, website: 'x'}, newIp()));

    expect(spam.status).toBe(real.status);
    expect(await spam.json()).toEqual(realBody);
    expect(await testDb.db.select().from(feedback)).toHaveLength(0);
  });
});

describe('rate limit', () => {
  it('contact: 6th request from the same IP gets 429, another IP is fine', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      expect((await contact.POST(post('/api/contact', contactBody, ip))).status).toBe(200);
    }

    const blocked = await contact.POST(post('/api/contact', contactBody, ip));
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toMatchObject({success: false, message: limitMessage});
    expect((await contact.POST(post('/api/contact', contactBody, newIp()))).status).toBe(200);
  });

  it('feedback: 6th request from the same IP gets 429, another IP is fine', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody, ip))).status).toBe(200);
    }

    const blocked = await feedbackRoute.POST(post('/api/feedback', feedbackBody, ip));
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toMatchObject({success: false, message: limitMessage});
    expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody, newIp()))).status).toBe(200);
  });

  it('limits are per form', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      await contact.POST(post('/api/contact', contactBody, ip));
    }

    expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody, ip))).status).toBe(200);
  });
});
