// @vitest-environment node
import {desc, isNull} from 'drizzle-orm';
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));

vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {db, submissions, feedback} = await import('@lib/db');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

beforeEach(() => {
  testDb.reset();
});

afterAll(() => {
  testDb.close();
});

describe('submissions', () => {
  it('stores and reads a contact submission with defaults', async () => {
    const [saved] = await db.insert(submissions).values({
      name: 'Jan', email: 'jan@example.com', phone: null, subject: 'Vraag', message: 'Hallo\nwereld',
    }).returning();

    expect(saved.id).toMatch(/^[\da-f-]{36}$/);
    expect(saved.readAt).toBeNull();
    expect(saved.archivedAt).toBeNull();

    const [read] = await db.select().from(submissions);
    expect(read).toEqual(saved);
    expect(read.createdAt).toBeInstanceOf(Date);
  });

  it('filters unread and orders newest first', async () => {
    await db.insert(submissions).values([
      {name: 'A', email: 'a@x.be', subject: 'S', message: 'M', createdAt: new Date('2026-01-01'), readAt: new Date('2026-01-02')},
      {name: 'B', email: 'b@x.be', subject: 'S', message: 'M', createdAt: new Date('2026-02-01')},
      {name: 'C', email: 'c@x.be', subject: 'S', message: 'M', createdAt: new Date('2026-03-01')},
    ]);

    const unread = await db.select().from(submissions).where(isNull(submissions.readAt)).orderBy(desc(submissions.createdAt));

    expect(unread.map(row => row.name)).toEqual(['C', 'B']);
  });
});

describe('feedback', () => {
  it('stores and reads feedback with optional fields', async () => {
    const [saved] = await db.insert(feedback).values({
      rating: 4, comment: 'Mooi', pageUrl: '/nieuws', userAgent: 'test',
    }).returning();

    expect(saved).toEqual(expect.objectContaining({
      rating: 4, comment: 'Mooi', email: null, pageUrl: '/nieuws', readAt: null, archivedAt: null,
    }));
    expect(await db.select().from(feedback)).toHaveLength(1);
  });
});
