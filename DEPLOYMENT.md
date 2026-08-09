# FemRes Deployment Guide | 部署指南

FemRes deploys to Vercel with Supabase Postgres and optional Cloudflare R2 media storage.

## Prerequisites

- Node.js 24
- Vercel account
- Supabase Postgres database
- Cloudflare R2 bucket, optional for media uploads

## Local Setup

```bash
npm ci
cp .env.example .env.local
npm run test:dependency-security
npm run test:db-security
npm run lint
npm run build
```

Local utility scripts read environment variables from `.env.local` first, then `.env`.

## Database Setup

For a new Supabase project:

1. Create the project and run `schema-supabase.sql` in the SQL Editor.
2. Run `sql/verify-supabase-rls.sql`; it must complete without an exception.
3. Disable **Enable Data API** in Supabase Dashboard when no REST, GraphQL, or
   Supabase client consumers exist. FemRes currently uses none of them.
4. Copy the direct database connection string into `DATABASE_URL`.

For an existing Supabase project, first connect with the exact `DATABASE_URL`
used by Vercel and confirm the application role will keep working after
default-deny RLS is enabled:

If the database predates comment reporting, run
`sql/20260719_add_comment_reports.sql` before this check.

```sql
SELECT
  current_user,
  c.relname AS table_name,
  pg_get_userbyid(c.relowner) AS table_owner,
  c.relowner = r.oid OR r.rolsuper OR r.rolbypassrls AS survives_no_policy_rls
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_roles AS r ON r.rolname = current_user
WHERE n.nspname = 'public'
  AND c.relname IN (
    'users',
    'user_interactions',
    'comments',
    'comment_likes',
    'comment_reports',
    'newsletter_subscribers'
  )
ORDER BY c.relname;
```

All six rows must report `survives_no_policy_rls = true`. Then:

1. Confirm no Edge Function, management script, or other external consumer uses
   the Supabase `service_role` key to access these six tables.
2. Run `sql/20260715_harden_supabase_rls.sql` in the SQL Editor.
3. Run `sql/verify-supabase-rls.sql` and rerun Supabase Database Linter.
4. Disable **Enable Data API** after confirming there are no REST, GraphQL, RPC,
   or Supabase client consumers.

For a non-Supabase PostgreSQL database, run `sql/schema.sql`. The Supabase RLS
and Data API hardening does not apply to that schema.

## Environment Variables

Required:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

Optional:

```env
DATABASE_SSL_REJECT_UNAUTHORIZED=true
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=femres
PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
```

Leave `DATABASE_SSL_REJECT_UNAUTHORIZED` unset for Supabase pooler connections that
require relaxed certificate checks. Set it to `true` only for database endpoints with
trusted CA verification.

For Neon to Supabase migration only:

```env
NEON_DATABASE_URL=postgresql://...
```

## Deploy to Vercel

```bash
vercel
vercel --prod
```

Set the same required environment variables in the Vercel project dashboard before production deployment.

## CI

GitHub Actions installs with `npm ci`, checks dependency and database security,
runs `npm run lint` and `npm run build`, then verifies reader journeys in
Chromium with `npm run test:e2e` on pushes and pull requests to `main`.
