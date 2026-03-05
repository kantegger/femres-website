import type { APIRoute } from 'astro';

export const prerender = false;
import { toggleCommentLike } from '../../../../lib/db';
import { verifyToken, extractBearerToken } from '../../../../lib/auth';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const commentId = params.commentId;
    if (!commentId) {
      return new Response(
        JSON.stringify({ error: 'Comment ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    const isLiked = await toggleCommentLike( commentId as string, payload.userId);
    
    return new Response(
      JSON.stringify({ 
        liked: isLiked,
        message: isLiked ? 'Comment liked' : 'Comment unliked'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Toggle comment like error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};