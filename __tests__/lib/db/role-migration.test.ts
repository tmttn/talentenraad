// @vitest-environment node
import path from 'node:path';
import Database from 'better-sqlite3';
import {drizzle} from 'drizzle-orm/better-sqlite3';
import {migrate} from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'node:fs';
import os from 'node:os';
import {describe, expect, it} from 'vitest';

describe('role migration on a database with existing users', () => {
  it('turns is_admin = 1 into admin and everyone else into redacteur, keeping the rows', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talentenraad-role-'));
    const full = path.join(process.cwd(), 'drizzle');
    const journal = JSON.parse(fs.readFileSync(path.join(full, 'meta', '_journal.json'), 'utf8')) as {entries: Array<{tag: string}>};
    expect(journal.entries.length).toBeGreaterThan(1);

    // Production state: only the first migration applied.
    const before = path.join(directory, 'before');
    fs.mkdirSync(path.join(before, 'meta'), {recursive: true});
    const [first] = journal.entries;
    fs.copyFileSync(path.join(full, `${first.tag}.sql`), path.join(before, `${first.tag}.sql`));
    fs.writeFileSync(path.join(before, 'meta', '_journal.json'), JSON.stringify({...journal, entries: [first]}));

    const client = new Database(':memory:');
    const db = drizzle(client);
    migrate(db, {migrationsFolder: before});
    client.exec(`insert into users (id, email, is_admin) values ('a', 'admin@example.com', 1), ('b', 'other@example.com', 0)`);

    migrate(db, {migrationsFolder: full});

    const rows = client.prepare('select email, role, is_admin from users order by email').all();
    client.close();
    fs.rmSync(directory, {recursive: true, force: true});

    expect(rows).toEqual([
      {email: 'admin@example.com', role: 'admin', is_admin: 1},
      {email: 'other@example.com', role: 'redacteur', is_admin: 0},
    ]);
  });
});
