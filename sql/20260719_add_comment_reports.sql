BEGIN;

CREATE TABLE IF NOT EXISTS public.comment_reports (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate', 'privacy', 'other')),
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_status
    ON public.comment_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id
    ON public.comment_reports(comment_id);

ALTER TABLE public.comment_reports NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES
ON TABLE public.comment_reports
FROM anon, authenticated, service_role;

REVOKE ALL PRIVILEGES
ON TABLE public.comment_reports
FROM PUBLIC;

COMMIT;
