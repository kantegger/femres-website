import type { APIRoute } from 'astro';
import { jsonResponse, validateRouteId } from '../../../../lib/api';
import {
  authConfigErrorResponse,
  csrfErrorResponse,
  extractAuthToken,
  getJwtSecret,
  isSameOriginRequest,
  verifyToken,
} from '../../../../lib/auth';
import { createCommentReport, type CommentReportReason } from '../../../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../../../lib/rateLimit';

const REPORT_REASONS = new Set<CommentReportReason>(['spam', 'harassment', 'hate', 'privacy', 'other']);

interface ReportCommentBody {
  reason?: unknown;
  details?: unknown;
}

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  try {
    if (!isSameOriginRequest(request)) return csrfErrorResponse();

    const limit = checkRateLimit({ key: 'comments:report', limit: 10, windowMs: 60 * 60 * 1000, request });
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const token = extractAuthToken(request);
    if (!token) return jsonResponse({ error: 'Authorization token required' }, 401);

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) return authConfigErrorResponse();

    const payload = await verifyToken(token, jwtSecret);
    if (!payload) return jsonResponse({ error: 'Invalid or expired token' }, 401);

    const commentId = params.commentId;
    const commentIdError = validateRouteId(commentId, 'Comment ID');
    if (commentIdError || !commentId) return commentIdError ?? jsonResponse({ error: 'Comment ID is required' }, 400);

    let body: ReportCommentBody;
    try {
      body = await request.json() as ReportCommentBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const reason = typeof body.reason === 'string' ? body.reason : '';
    const details = typeof body.details === 'string' ? body.details.trim() : '';
    if (!REPORT_REASONS.has(reason as CommentReportReason)) {
      return jsonResponse({ error: 'Invalid report reason' }, 400);
    }
    if (details.length > 500) return jsonResponse({ error: 'Details must be 500 characters or less' }, 400);

    await createCommentReport({
      comment_id: commentId,
      reporter_id: payload.userId,
      reason: reason as CommentReportReason,
      details: details || undefined,
    });

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('Report comment error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
