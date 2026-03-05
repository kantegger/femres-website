import type { APIRoute } from 'astro';
import { verifyToken, extractBearerToken } from '../../../lib/auth';
import { updateUsername, getUserByUsername } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const jwtSecret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const decoded = await verifyToken(token, jwtSecret);

    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { username } = body;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return new Response(JSON.stringify({ error: '用户名至少需要2个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const trimmedUsername = username.trim();

    // Check if username is already taken
    const existingUser = await getUserByUsername(trimmedUsername);

    if (existingUser && existingUser.id !== decoded.userId) {
      return new Response(JSON.stringify({ error: '用户名已被使用' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update username
    const updatedUser = await updateUsername(decoded.userId, trimmedUsername);

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: '更新用户名失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: updatedUser
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update username error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};