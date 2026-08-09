-- Lock FemRes internal tables out of Supabase's Data API.
--
-- Preconditions:
--   1. Run the application-role check documented in DEPLOYMENT.md with the same
--      DATABASE_URL used by Vercel.
--   2. Confirm there are no external service_role consumers of these tables.
--
-- This migration is transactional and safe to run more than once.

BEGIN;

-- Keep the direct PostgreSQL table owner working while making all other roles
-- subject to the default-deny behavior of RLS.
ALTER TABLE public.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comments NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers NO FORCE ROW LEVEL SECURITY;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- These roles are not used by FemRes. Removing their table privileges closes
-- REST and GraphQL access even if the Supabase Data API remains enabled.
REVOKE ALL PRIVILEGES
ON TABLE
    public.users,
    public.user_interactions,
    public.comments,
    public.comment_likes,
    public.newsletter_subscribers
FROM anon, authenticated, service_role;

REVOKE ALL PRIVILEGES
ON TABLE
    public.users,
    public.user_interactions,
    public.comments,
    public.comment_likes,
    public.newsletter_subscribers
FROM PUBLIC;

-- Supabase projects created before secure-by-default grants may automatically
-- expose future objects. Change the defaults for objects created by postgres.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL PRIVILEGES
    ON TABLES FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL PRIVILEGES
    ON SEQUENCES FROM anon, authenticated, service_role;

COMMIT;
