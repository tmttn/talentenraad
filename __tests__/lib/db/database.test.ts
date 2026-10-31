// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {createDatabase} from '@lib/db/open';
import {runMigrations} from '@lib/db/migrate';
import {auditLogs, submissions, users} from '@lib/db/schema';
import {createTestDb} from '../../helpers/db';

const tables = ['audit_logs', 'feedback', 'login_tokens', 'submissions', 'users'];

describe('migrations on an empty database (first start)', () => {
  it('creates exactly the app tables', () => {
    const test = createTestDb();
    const names = test.client
      .prepare('select name from sqlite_master where type = \'table\' and name not like \'sqlite_%\' and name not like \'__drizzle%\' order by name')
      .all()
      .map(row => (row as {name: string}).name);
    test.close();

    expect(names).toEqual(tables);
  });

  it('has no auth0_id column on users', () => {
    const test = createTestDb();
    const columns = test.client.prepare('pragma table_info(users)').all().map(row => (row as {name: string}).name);
    test.close();

    expect(columns).not.toContain('auth0_id');
    expect(columns).toContain('is_admin');
  });

  it('fills id and timestamp defaults on insert', async () => {
    const test = createTestDb();
    const [row] = await test.db.insert(users).values({email: 'a@example.com'}).returning();
    test.close();

    expect(row.id).toMatch(/^[\da-f-]{36}$/);
    expect(row.isAdmin).toBe(false);
    expect(Math.abs(row.createdAt.getTime() - Date.now())).toBeLessThan(5000);
  });
});

describe('file database', () => {
  let directory: string;
  let file: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talentenraad-db-'));
    file = path.join(directory, 'nested', 'test.db');
  });

  afterEach(() => {
    fs.rmSync(directory, {recursive: true, force: true});
  });

  it('creates the directory and sets WAL, busy timeout and foreign keys', () => {
    const {client} = createDatabase(file);

    expect(fs.existsSync(file)).toBe(true);
    expect(client.pragma('journal_mode', {simple: true})).toBe('wal');
    expect(client.pragma('busy_timeout', {simple: true})).toBe(5000);
    expect(client.pragma('foreign_keys', {simple: true})).toBe(1);
    client.close();
  });

  it('re-running migrations is idempotent and keeps data (restart)', async () => {
    const first = createDatabase(file);
    runMigrations(first.db);
    await first.db.insert(submissions).values({
      name: 'Jan', email: 'jan@example.com', subject: 'Hallo', message: 'Test',
    });
    first.client.close();

    const second = createDatabase(file);
    expect(() => {
      runMigrations(second.db);
      runMigrations(second.db);
    }).not.toThrow();
    const rows = await second.db.select().from(submissions);
    second.client.close();

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Jan');
  });

  it('a writer waits for a lock held by another connection instead of failing with SQLITE_BUSY', async () => {
    const first = createDatabase(file);
    runMigrations(first.db);
    first.client.close();

    // A worker thread holds the write lock for 600 ms, like a slow concurrent request.
    const worker = new Worker(`
      const {workerData, parentPort} = require('node:worker_threads');
      const Database = require('better-sqlite3');
      const client = new Database(workerData.file);
      client.pragma('journal_mode = WAL');
      client.exec('begin immediate');
      client.prepare('insert into audit_logs (id, action_type, resource_type, user_email) values (?, ?, ?, ?)')
        .run('held', 'create', 'user', 'held@example.com');
      parentPort.postMessage('locked');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 600);
      client.exec('commit');
      client.close();
      parentPort.postMessage('released');
    `, {eval: true, workerData: {file}});
    await new Promise<void>((resolve, reject) => {
      worker.once('message', () => {
        resolve();
      });
      worker.once('error', reject);
    });
    const released = new Promise<void>(resolve => {
      worker.once('message', () => {
        resolve();
      });
    });

    const second = createDatabase(file);
    const started = Date.now();
    await second.db.insert(submissions).values({
      name: 'Piet', email: 'piet@example.com', subject: 'S', message: 'M',
    });
    const waited = Date.now() - started;
    await released;

    const audit = await second.db.select().from(auditLogs);
    second.client.close();

    expect(waited).toBeGreaterThanOrEqual(400);
    expect(audit.map(row => row.id)).toEqual(['held']);
  });

  it('interleaved writes from two connections all succeed', async () => {
    const first = createDatabase(file);
    runMigrations(first.db);
    const second = createDatabase(file);

    for (let index = 0; index < 50; index++) {
      const target = index % 2 === 0 ? first : second;
      // eslint-disable-next-line no-await-in-loop
      await target.db.insert(auditLogs).values({
        actionType: 'create', resourceType: 'user', userEmail: `u${index}@example.com`,
      });
      // eslint-disable-next-line no-await-in-loop
      await (index % 2 === 0 ? second : first).db.insert(submissions).values({
        name: 'Piet', email: 'piet@example.com', subject: 'S', message: 'M',
      });
    }

    const audit = await first.db.select().from(auditLogs);
    const contact = await second.db.select().from(submissions);
    first.client.close();
    second.client.close();

    expect(audit).toHaveLength(50);
    expect(contact).toHaveLength(50);
  });
});
