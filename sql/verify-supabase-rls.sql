-- Verify the FemRes Supabase boundary after applying the RLS hardening migration.
-- Run as the database owner in Supabase SQL Editor or through psql.

DO $verify$
DECLARE
    target_table TEXT;
    api_role TEXT;
    rls_enabled BOOLEAN;
    rls_forced BOOLEAN;
BEGIN
    FOREACH target_table IN ARRAY ARRAY[
        'users',
        'user_interactions',
        'comments',
        'comment_likes',
        'comment_reports',
        'newsletter_subscribers'
    ]
    LOOP
        SELECT c.relrowsecurity, c.relforcerowsecurity
          INTO rls_enabled, rls_forced
          FROM pg_catalog.pg_class AS c
          JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'
           AND c.relname = target_table
           AND c.relkind = 'r';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Required table public.% does not exist', target_table;
        END IF;

        IF NOT rls_enabled THEN
            RAISE EXCEPTION 'RLS is disabled on public.%', target_table;
        END IF;

        IF rls_forced THEN
            RAISE EXCEPTION 'RLS is forced on public.% and would block the owner-backed application connection', target_table;
        END IF;

        FOR api_role IN
            SELECT rolname
              FROM pg_catalog.pg_roles
             WHERE rolname IN ('anon', 'authenticated', 'service_role')
        LOOP
            IF has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'SELECT')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'INSERT')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'UPDATE')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'DELETE')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'TRUNCATE')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'REFERENCES')
               OR has_table_privilege(api_role, format('%I.%I', 'public', target_table), 'TRIGGER')
            THEN
                RAISE EXCEPTION 'Data API role % still has data privileges on public.%', api_role, target_table;
            END IF;
        END LOOP;
    END LOOP;

    IF EXISTS (
        SELECT 1
          FROM pg_catalog.pg_default_acl AS d
          CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) AS privilege
          JOIN pg_catalog.pg_roles AS creator ON creator.oid = d.defaclrole
          LEFT JOIN pg_catalog.pg_roles AS grantee ON grantee.oid = privilege.grantee
         WHERE creator.rolname = 'postgres'
           AND d.defaclobjtype IN ('r', 'S')
           AND (
               d.defaclnamespace = 0
               OR d.defaclnamespace = 'public'::regnamespace
           )
           AND COALESCE(grantee.rolname, 'PUBLIC') IN (
               'anon',
               'authenticated',
               'service_role',
               'PUBLIC'
           )
    ) THEN
        RAISE EXCEPTION 'postgres default ACLs still expose future public tables or sequences to Data API roles';
    END IF;
END
$verify$;

SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    pg_get_userbyid(c.relowner) AS table_owner
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
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
