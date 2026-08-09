import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../lib/api';
import { authConfigErrorResponse, csrfErrorResponse, getJwtSecret, isSameOriginRequest, verifyToken, extractAuthToken } from '../../../lib/auth';
import { updateUsername, getUserByUsername } from '../../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'auth:update-username',
      limit: 5,
      windowMs: 60 * 60 * 1000,
      request
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfter);
    }

    const token = extractAuthToken(request);

    if (!token) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Verify token
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return authConfigErrorResponse();
    }
    const decoded = await verifyToken(token, jwtSecret);

    if (!decoded) {
      return jsonResponse({ error: 'Invalid token' }, 401);
    }

    // Parse request body
    const body = await request.json();
    const { username } = body;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return jsonResponse({ error: '用户名至少需要2个字符' }, 400);
    }

    const trimmedUsername = username.trim();

    // Check if username is already taken
    const existingUser = await getUserByUsername(trimmedUsername);

    if (existingUser && existingUser.id !== decoded.userId) {
      return jsonResponse({ error: '用户名已被使用' }, 400);
    }

    // Update username
    const updatedUser = await updateUsername(decoded.userId, trimmedUsername);

    if (!updatedUser) {
      return jsonResponse({ error: '更新用户名失败' }, 500);
    }

    return jsonResponse({
      success: true,
      user: updatedUser
    }, 200);
  } catch (error) {
    console.error('Update username error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
