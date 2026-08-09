import type { APIRoute } from 'astro';

export const prerender = false;
import { toggleCommentLike } from '../../../../lib/db';
import { authConfigErrorResponse, csrfErrorResponse, getJwtSecret, isSameOriginRequest, verifyToken, extractAuthToken } from '../../../../lib/auth';
import { checkRateLimit, rateLimitResponse } from '../../../../lib/rateLimit';
import { jsonResponse, validateRouteId } from '../../../../lib/api';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'comments:like',
      limit: 60,
      windowMs: 60 * 1000,
      request
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfter);
    }

    const commentId = params.commentId;
    const commentIdError = validateRouteId(commentId, 'Comment ID');
    if (commentIdError || !commentId) {
      return commentIdError ?? jsonResponse({ error: 'Comment ID is required' }, 400);
    }

    // Verify authentication
    const token = extractAuthToken(request);

    if (!token) {
      return jsonResponse({ error: 'Authorization token required' }, 401);
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return authConfigErrorResponse();
    }

    const payload = await verifyToken(token, jwtSecret);

    if (!payload) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    const isLiked = await toggleCommentLike(commentId, payload.userId);
    
    return jsonResponse({
      liked: isLiked,
      message: isLiked ? 'Comment liked' : 'Comment unliked'
    }, 200);

  } catch (error) {
    console.error('Toggle comment like error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
