import type { APIRoute } from 'astro';

export const prerender = false;
import { jsonResponse } from '../../../lib/api';
import { getUserById } from '../../../lib/db';
import { authConfigErrorResponse, getJwtSecret, verifyToken, extractAuthToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
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

    const user = await getUserById(payload.userId);

    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404);
    }

    // Return user data without password hash
    const { password_hash, ...userWithoutPassword } = user;
    
    return jsonResponse({ user: userWithoutPassword }, 200);

  } catch (error) {
    console.error('Me endpoint error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
