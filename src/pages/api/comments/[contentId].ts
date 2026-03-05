import type { APIRoute } from 'astro';

export const prerender = false;
import { getCommentsByContent, createComment } from '../../../lib/db';
import { verifyToken, extractBearerToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const contentId = params.contentId;
    if (!contentId) {
      return new Response(
        JSON.stringify({ error: 'Content ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract user ID from token if provided (for like status)
    const authHeader = request.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    let userId: string | undefined;

    if (token) {
      const jwtSecret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;
      if (jwtSecret) {
        const payload = await verifyToken(token, jwtSecret);
        if (payload) {
          userId = payload.userId;
        }
      }
    }

    const comments = await getCommentsByContent(contentId as string, userId);
    
    return new Response(
      JSON.stringify({ comments }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Get comments error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const contentId = params.contentId;
    if (!contentId) {
      return new Response(
        JSON.stringify({ error: 'Content ID is required' }),
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

    if (!jwtSecret) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = await verifyToken(token, jwtSecret);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { content, content_type, parent_id } = await request.json();

    if (!content || !content_type) {
      return new Response(
        JSON.stringify({ error: 'Content and content_type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (content.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Content must be 1000 characters or less' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comment = await createComment({
      content: content.trim(),
      content_id: contentId as string,
      content_type,
      user_id: payload.userId,
      parent_id
    });

    // Add username to response
    const commentWithUser = {
      ...comment,
      username: payload.username,
      is_liked: false,
      replies: []
    };
    
    return new Response(
      JSON.stringify({ comment: commentWithUser }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Create comment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};