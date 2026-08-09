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
import { deleteComment } from '../../../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../../../lib/rateLimit';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    if (!isSameOriginRequest(request)) return csrfErrorResponse();

    const limit = checkRateLimit({ key: 'comments:delete', limit: 20, windowMs: 15 * 60 * 1000, request });
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

    const deleted = await deleteComment(commentId, payload.userId);
    if (!deleted) return jsonResponse({ error: 'Comment not found' }, 404);

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('Delete comment error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
