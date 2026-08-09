import type { APIRoute } from 'astro';

export const prerender = false;
import { getCommentsByContent, createComment } from '../../../lib/db';
import { authConfigErrorResponse, csrfErrorResponse, getJwtSecret, isSameOriginRequest, verifyToken, extractAuthToken } from '../../../lib/auth';
import { isContentType } from '../../../lib/content';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';
import { jsonResponse, validateRouteId } from '../../../lib/api';

interface CreateCommentBody {
  content?: unknown;
  content_type?: unknown;
  parent_id?: unknown;
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const contentId = params.contentId;
    const contentIdError = validateRouteId(contentId, 'Content ID');
    if (contentIdError || !contentId) {
      return contentIdError ?? jsonResponse({ error: 'Content ID is required' }, 400);
    }

    // Extract user ID from token if provided (for like status)
    const token = extractAuthToken(request);
    let userId: string | undefined;

    if (token) {
      const jwtSecret = getJwtSecret();
      if (jwtSecret) {
        const payload = await verifyToken(token, jwtSecret);
        if (payload) {
          userId = payload.userId;
        }
      }
    }

    const comments = await getCommentsByContent(contentId, userId);
    
    return jsonResponse({ comments }, 200);

  } catch (error) {
    console.error('Get comments error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'comments:create',
      limit: 20,
      windowMs: 15 * 60 * 1000,
      request
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfter);
    }

    const contentId = params.contentId;
    const contentIdError = validateRouteId(contentId, 'Content ID');
    if (contentIdError || !contentId) {
      return contentIdError ?? jsonResponse({ error: 'Content ID is required' }, 400);
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

    let body: CreateCommentBody;
    try {
      body = await request.json() as CreateCommentBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { content, content_type, parent_id } = body;

    if (typeof content !== 'string' || !content.trim() || typeof content_type !== 'string') {
      return jsonResponse({ error: 'Content and content_type are required' }, 400);
    }

    if (!isContentType(content_type)) {
      return jsonResponse({ error: 'Invalid content_type' }, 400);
    }

    if (parent_id !== undefined && typeof parent_id !== 'string') {
      return jsonResponse({ error: 'parent_id must be a string' }, 400);
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 1000) {
      return jsonResponse({ error: 'Content must be 1000 characters or less' }, 400);
    }

    const comment = await createComment({
      content: trimmedContent,
      content_id: contentId,
      content_type,
      user_id: payload.userId,
      parent_id: parent_id || undefined
    });

    // Add username to response
    const commentWithUser = {
      ...comment,
      username: payload.username,
      is_liked: false,
      replies: []
    };
    
    return jsonResponse({ comment: commentWithUser }, 201);

  } catch (error) {
    console.error('Create comment error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
