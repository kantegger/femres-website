import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../lib/api';
import {
  authConfigErrorResponse,
  clearAuthCookie,
  csrfErrorResponse,
  extractAuthToken,
  getJwtSecret,
  isSameOriginRequest,
  verifyPassword,
  verifyToken,
} from '../../../lib/auth';
import { deleteUserAccount, getUserById } from '../../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

interface DeleteAccountBody {
  password?: unknown;
}

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
  try {
    if (!isSameOriginRequest(request)) return csrfErrorResponse();

    const limit = checkRateLimit({
      key: 'auth:delete-account',
      limit: 5,
      windowMs: 60 * 60 * 1000,
      request,
    });
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const token = extractAuthToken(request);
    if (!token) return jsonResponse({ error: 'Unauthorized' }, 401);

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) return authConfigErrorResponse();

    const payload = await verifyToken(token, jwtSecret);
    if (!payload) return jsonResponse({ error: 'Invalid or expired token' }, 401);

    let body: DeleteAccountBody;
    try {
      body = await request.json() as DeleteAccountBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const password = typeof body.password === 'string' ? body.password : '';
    if (!password) return jsonResponse({ error: 'Password is required' }, 400);

    const user = await getUserById(payload.userId);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, { 'Set-Cookie': clearAuthCookie() });

    if (!await verifyPassword(password, user.password_hash)) {
      return jsonResponse({ error: 'Password is incorrect' }, 403);
    }

    const deleted = await deleteUserAccount(payload.userId);
    if (!deleted) return jsonResponse({ error: 'Account could not be deleted' }, 500);

    return jsonResponse({ success: true }, 200, { 'Set-Cookie': clearAuthCookie() });
  } catch (error) {
    console.error('Delete account error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
