import type { APIRoute } from 'astro';

export const prerender = false;
import { jsonResponse } from '../../../lib/api';
import { authConfigErrorResponse, getJwtSecret, verifyToken, extractAuthToken } from '../../../lib/auth';
import { getUserInteractions } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
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

    // Get user's likes and bookmarks
    const likesData = await getUserInteractions(payload.userId, 'like');
    const bookmarksData = await getUserInteractions(payload.userId, 'bookmark');

    return jsonResponse({
      likes: likesData.map(interaction => interaction.content_id),
      bookmarks: bookmarksData.map(interaction => interaction.content_id)
    }, 200);

  } catch (error) {
    console.error('Get user interactions error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
