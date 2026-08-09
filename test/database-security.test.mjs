import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targetTables = [
  'users',
  'user_interactions',
  'comments',
  'comment_likes',
  'comment_reports',
  'newsletter_subscribers'
];

const originalMigrationTables = targetTables.filter((table) => table !== 'comment_reports');

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function compact(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\r\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertRevokesTargetTables(sql, label) {
  const dataApiRevoke = sql.match(
    /REVOKE ALL PRIVILEGES ON TABLE (.*?) FROM anon, authenticated, service_role;/i
  );
  const publicRevoke = sql.match(/REVOKE ALL PRIVILEGES ON TABLE (.*?) FROM PUBLIC;/i);

  assert.ok(dataApiRevoke, `${label} must revoke Data API role privileges`);
  assert.ok(publicRevoke, `${label} must revoke PUBLIC privileges`);

  for (const table of targetTables) {
    const qualifiedTable = `public.${table}`;
    assert.match(dataApiRevoke[1], new RegExp(`(?:^|, )${escapeRegExp(qualifiedTable)}(?:,|$)`));
    assert.match(publicRevoke[1], new RegExp(`(?:^|, )${escapeRegExp(qualifiedTable)}(?:,|$)`));
  }
}

test('schema-supabase.sql enables non-forced RLS and revokes access for every internal table', () => {
  const sql = compact(read('schema-supabase.sql'));

  for (const table of targetTables) {
    const escapedTable = escapeRegExp(table);
    assert.match(
      sql,
      new RegExp(`ALTER TABLE public\\.${escapedTable} ENABLE ROW LEVEL SECURITY;`, 'i'),
      `schema-supabase.sql must enable RLS on public.${table}`
    );
    assert.match(
      sql,
      new RegExp(`ALTER TABLE public\\.${escapedTable} NO FORCE ROW LEVEL SECURITY;`, 'i'),
      `schema-supabase.sql must preserve table-owner access on public.${table}`
    );
  }

  assertRevokesTargetTables(sql, 'schema-supabase.sql');
});

test('the original Supabase migration closes its current and future Data API grants', () => {
  const sql = compact(read('sql/20260715_harden_supabase_rls.sql'));

  assert.match(sql, /BEGIN;/i);
  assert.match(sql, /COMMIT;/i);

  for (const table of originalMigrationTables) {
    const escapedTable = escapeRegExp(table);
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${escapedTable} ENABLE ROW LEVEL SECURITY;`, 'i'));
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${escapedTable} NO FORCE ROW LEVEL SECURITY;`, 'i'));
  }

  const dataApiRevoke = sql.match(/REVOKE ALL PRIVILEGES ON TABLE (.*?) FROM anon, authenticated, service_role;/i);
  const publicRevoke = sql.match(/REVOKE ALL PRIVILEGES ON TABLE (.*?) FROM PUBLIC;/i);
  assert.ok(dataApiRevoke);
  assert.ok(publicRevoke);
  for (const table of originalMigrationTables) {
    const qualifiedTable = `public.${table}`;
    assert.match(dataApiRevoke[1], new RegExp(`(?:^|, )${escapeRegExp(qualifiedTable)}(?:,|$)`));
    assert.match(publicRevoke[1], new RegExp(`(?:^|, )${escapeRegExp(qualifiedTable)}(?:,|$)`));
  }
  assert.match(
    sql,
    /ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated, service_role;/i
  );
  assert.match(
    sql,
    /ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated, service_role;/i
  );
  assert.doesNotMatch(sql, /CREATE\s+POLICY/i, 'custom JWT auth must not be replaced by incompatible Supabase Auth policies');
  const withoutNoForceStatements = sql.replace(/NO FORCE ROW LEVEL SECURITY;/gi, '');
  assert.doesNotMatch(withoutNoForceStatements, /FORCE ROW LEVEL SECURITY;/i);
});

test('the comment reports migration preserves the server-only database boundary', () => {
  const sql = compact(read('sql/20260719_add_comment_reports.sql'));

  assert.match(sql, /BEGIN;/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.comment_reports/i);
  assert.match(sql, /ALTER TABLE public\.comment_reports NO FORCE ROW LEVEL SECURITY;/i);
  assert.match(sql, /ALTER TABLE public\.comment_reports ENABLE ROW LEVEL SECURITY;/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\.comment_reports FROM anon, authenticated, service_role;/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\.comment_reports FROM PUBLIC;/i);
  assert.match(sql, /COMMIT;/i);
  assert.doesNotMatch(sql, /CREATE\s+POLICY/i);
});

test('the runtime verifier checks RLS and effective Data API privileges', () => {
  const sql = compact(read('sql/verify-supabase-rls.sql'));

  for (const table of targetTables) {
    assert.match(sql, new RegExp(`'${escapeRegExp(table)}'`));
  }

  for (const role of ['anon', 'authenticated', 'service_role']) {
    assert.match(sql, new RegExp(`'${role}'`));
  }

  assert.match(sql, /relrowsecurity/i);
  assert.match(sql, /relforcerowsecurity/i);
  assert.match(sql, /has_table_privilege/i);
  assert.match(sql, /pg_default_acl/i);
  assert.match(sql, /aclexplode/i);
});
