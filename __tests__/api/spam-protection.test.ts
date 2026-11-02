// @vitest-environment node
import {NextRequest} from 'next/server';
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));
const sendContactNotification = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@lib/email/messages', () => ({sendContactNotification}));
vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
vi.mock('@lib/db', async () => {
  const schema = await import('../../app/lib/db/schema');
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {submissions, feedback} = await import('@lib/db/schema');
const {submitContact} = await import('@lib/contact-submit');
const {issueFormToken} = await import('@lib/form-timing');
const {createPersistentRateLimiter} = await import('@lib/persistent-rate-limit');
const {rateLimitHits} = await import('@lib/db/schema');
const feedbackRoute = await import('../../app/api/feedback/route');
const feedbackToken = await import('../../app/api/feedback/token/route');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

let ipCounter = 0;
const newIp = () => `10.0.0.${++ipCounter}`;

const post = (path: string, body: unknown, ip: string) => new NextRequest(`http://localhost${path}`, {
  method: 'POST',
  headers: {'x-forwarded-for': ip},
  body: JSON.stringify(body),
});

// A form shown ten seconds ago, as a person would send it
const contactBody = () => ({name: 'Ouder', email: 'ouder@example.com', message: 'Een bericht van genoeg lengte', formToken: issueFormToken('contact', Date.now() - 10_000)});
// A feedback form opened ten seconds ago
const feedbackBody = () => ({rating: 4, comment: 'Mooi', formToken: issueFormToken('feedback', Date.now() - 10_000)});
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

    const spam = await submitContact({...contactBody(), website: 'http://spam.example'}, newIp());

    expect(spam).toEqual({status: 'sent'});
    expect(await testDb.db.select().from(submissions)).toHaveLength(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('spam: honeypot');
    expect(JSON.stringify(log.mock.calls)).not.toContain('spam.example');
  });

  it('contact: a real message is stored and mailed', async () => {
    expect(await submitContact(contactBody(), newIp())).toEqual({status: 'sent'});
    expect(await testDb.db.select().from(submissions)).toHaveLength(1);
    expect(sendContactNotification).toHaveBeenCalledWith(expect.objectContaining({email: 'ouder@example.com', subject: 'vraag'}));
  });

  it('feedback: answers like a success but stores nothing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const real = await feedbackRoute.POST(post('/api/feedback', feedbackBody(), newIp()));
    const realBody = await real.json() as unknown;
    testDb.reset();

    const spam = await feedbackRoute.POST(post('/api/feedback', {...feedbackBody(), website: 'x'}, newIp()));

    expect(spam.status).toBe(real.status);
    expect(await spam.json()).toEqual(realBody);
    expect(await testDb.db.select().from(feedback)).toHaveLength(0);
  });
});

describe('rate limit', () => {
  it('contact: 6th message from the same IP is refused, another IP is fine', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      expect(await submitContact(contactBody(), ip)).toEqual({status: 'sent'});
    }

    expect(await submitContact(contactBody(), ip)).toEqual({status: 'limited'});
    expect(await submitContact(contactBody(), newIp())).toEqual({status: 'sent'});
  });

  it('feedback: 6th request from the same IP gets 429, another IP is fine', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody(), ip))).status).toBe(200);
    }

    const blocked = await feedbackRoute.POST(post('/api/feedback', feedbackBody(), ip));
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toMatchObject({success: false, message: limitMessage});
    expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody(), newIp()))).status).toBe(200);
  });

  it('limits are per form', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      await submitContact(contactBody(), ip);
    }

    expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody(), ip))).status).toBe(200);
  });
});

describe('form timing', () => {
  it.each([
    ['sent faster than a person types', () => issueFormToken('contact', Date.now() - 1000)],
    ['with a forged token', () => `${Date.now() - 10_000}.${'a'.repeat(43)}`],
    ['without a token', () => ''],
    ['with a token for another form', () => issueFormToken('feedback', Date.now() - 10_000)],
  ])('contact: a message %s is treated as spam: answered, not stored', async (_label, token) => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await submitContact({...contactBody(), formToken: token()}, newIp())).toEqual({status: 'sent'});
    expect(await testDb.db.select().from(submissions)).toHaveLength(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
    expect(log.mock.calls.flat().join(' ')).toMatch(/spam: form timing/);
  });

  it('contact: a form left open for more than a day asks to send again', async () => {
    const token = issueFormToken('contact', Date.now() - (25 * 60 * 60 * 1000));
    expect(await submitContact({...contactBody(), formToken: token}, newIp())).toEqual({status: 'expired'});
    expect(await testDb.db.select().from(submissions)).toHaveLength(0);
  });

  it('contact: validation comes first, so a quick empty form still shows what is missing', async () => {
    const result = await submitContact({name: '', email: '', message: '', formToken: issueFormToken('contact')}, newIp());
    expect(result).toMatchObject({status: 'invalid'});
  });
});

describe('persistent rate limit', () => {
  it('survives a restart: a new limiter on the same database still counts earlier hits', () => {
    const options = {scope: 'test', limit: 2, windowMs: 60_000};
    const ip = newIp();
    const first = createPersistentRateLimiter(options);
    expect(first.check(ip)).toBe(true);
    expect(first.check(ip)).toBe(true);

    const afterRestart = createPersistentRateLimiter(options);
    expect(afterRestart.check(ip)).toBe(false);
  });

  it('forgets hits outside the window and keeps scopes apart', () => {
    const ip = newIp();
    const limiter = createPersistentRateLimiter({scope: 'test', limit: 1, windowMs: 60_000});
    const now = Date.now();
    expect(limiter.check(ip, now - 120_000)).toBe(true);
    expect(limiter.check(ip, now)).toBe(true);
    expect(limiter.check(ip, now)).toBe(false);
    expect(createPersistentRateLimiter({scope: 'ander', limit: 1, windowMs: 60_000}).check(ip, now)).toBe(true);
  });

  it('stores a hash of the IP, never the address itself', async () => {
    const ip = '203.0.113.7';
    createPersistentRateLimiter({scope: 'test', limit: 5, windowMs: 60_000}).check(ip);
    const rows = await testDb.db.select().from(rateLimitHits);
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain(ip);
  });
});

describe('feedback form timing', () => {
  it('stores feedback sent with a token from when the form opened', async () => {
    const response = await feedbackRoute.POST(post('/api/feedback', feedbackBody(), newIp()));
    expect(await response.json()).toMatchObject({success: true});
    expect(await testDb.db.select().from(feedback)).toHaveLength(1);
  });

  it.each([
    ['sent too fast', () => issueFormToken('feedback', Date.now() - 500)],
    ['without a token', () => undefined],
    ['with a contact form token', () => issueFormToken('contact', Date.now() - 10_000)],
  ])('answers feedback %s normally but does not store it', async (_label, token) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const response = await feedbackRoute.POST(post('/api/feedback', {...feedbackBody(), formToken: token()}, newIp()));
    expect(await response.json()).toMatchObject({success: true});
    expect(await testDb.db.select().from(feedback)).toHaveLength(0);
  });

  it('asks to send again with a fresh, usable token when the form was open too long', async () => {
    const old = issueFormToken('feedback', Date.now() - (25 * 60 * 60 * 1000));
    const response = await feedbackRoute.POST(post('/api/feedback', {...feedbackBody(), formToken: old}, newIp()));
    expect(response.status).toBe(400);
    const body = await response.json() as {formToken: string};
    const again = await feedbackRoute.POST(post('/api/feedback', {...feedbackBody(), formToken: body.formToken}, newIp()));
    expect(await again.json()).toMatchObject({success: true});
    expect(await testDb.db.select().from(feedback)).toHaveLength(1);
  });

  it('hands out a fresh, uncached token signed for the feedback form', async () => {
    const response = feedbackToken.GET();
    expect(response.headers.get('cache-control')).toBe('no-store');
    const {token} = await response.json() as {token: string};
    const {checkFormToken} = await import('@lib/form-timing');
    expect(checkFormToken('feedback', token)).toBe('too-fast');
    expect(checkFormToken('feedback', token, Date.now() + 5000)).toBe('ok');
    expect(checkFormToken('contact', token, Date.now() + 5000)).toBe('invalid');
  });

  it('keeps the feedback rate limit in SQLite, apart from the contact form', async () => {
    const ip = newIp();
    for (let index = 0; index < 5; index++) {
      await feedbackRoute.POST(post('/api/feedback', feedbackBody(), ip));
    }

    const rows = await testDb.db.select().from(rateLimitHits);
    expect(rows.filter(row => row.scope === 'feedback')).toHaveLength(5);
    expect((await feedbackRoute.POST(post('/api/feedback', feedbackBody(), ip))).status).toBe(429);
    expect(await submitContact(contactBody(), ip)).toEqual({status: 'sent'});
  });
});

