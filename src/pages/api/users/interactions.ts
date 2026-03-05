import type { APIRoute } from 'astro';

export const prerender = false;
import { verifyToken, extractBearerToken } from '../../../lib/auth';
import { getUserInteractions } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jwtSecret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;
    const payload = await verifyToken(token, jwtSecret);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user's likes and bookmarks
    const likesData = await getUserInteractions(payload.userId, 'like');
    const bookmarksData = await getUserInteractions(payload.userId, 'bookmark');

    return new Response(
      JSON.stringify({
        likes: likesData.map(interaction => interaction.content_id),
        bookmarks: bookmarksData.map(interaction => interaction.content_id)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get user interactions error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
