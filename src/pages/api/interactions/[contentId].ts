import type { APIRoute } from 'astro';

export const prerender = false;
import { toggleUserInteraction } from '../../../lib/db';
import { authConfigErrorResponse, csrfErrorResponse, getJwtSecret, isSameOriginRequest, verifyToken, extractAuthToken } from '../../../lib/auth';
import { isContentType } from '../../../lib/content';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';
import { jsonResponse, validateRouteId } from '../../../lib/api';

const interactionTypes = ['like', 'bookmark'] as const;
type InteractionType = typeof interactionTypes[number];

interface InteractionBody {
  content_type?: unknown;
  interaction_type?: unknown;
}

const isInteractionType = (value: string): value is InteractionType =>
  interactionTypes.includes(value as InteractionType);

export const POST: APIRoute = async ({ params, request }) => {
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'interactions:toggle',
      limit: 60,
      windowMs: 60 * 1000,
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

    let body: InteractionBody;
    try {
      body = await request.json() as InteractionBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { content_type, interaction_type } = body;

    if (typeof content_type !== 'string' || typeof interaction_type !== 'string') {
      return jsonResponse({ error: 'content_type and interaction_type are required' }, 400);
    }

    if (!isContentType(content_type)) {
      return jsonResponse({ error: 'Invalid content_type' }, 400);
    }

    if (!isInteractionType(interaction_type)) {
      return jsonResponse({ error: 'interaction_type must be "like" or "bookmark"' }, 400);
    }

    const isActive = await toggleUserInteraction(
      payload.userId,
      contentId,
      content_type,
      interaction_type
    );
    
    return jsonResponse({
      active: isActive,
      message: `Content ${isActive ? interaction_type + 'd' : 'un' + interaction_type + 'd'}`
    }, 200);

  } catch (error) {
    console.error('Toggle interaction error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
