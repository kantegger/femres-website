import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../lib/api';
import { getUserByEmail, getUserByUsername } from '../../../lib/db';
import { authConfigErrorResponse, createAuthCookie, csrfErrorResponse, getJwtSecret, isSameOriginRequest, verifyPassword, generateToken, validateEmail } from '../../../lib/auth';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'auth:login',
      limit: 10,
      windowMs: 15 * 60 * 1000,
      request
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfter);
    }

    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return jsonResponse({ error: 'Email/username and password are required' }, 400);
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return authConfigErrorResponse();
    }

    // Determine if identifier is email or username
    const isEmail = validateEmail(identifier);
    const user = isEmail
      ? await getUserByEmail(identifier)
      : await getUserByUsername(identifier);

    if (!user) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await generateToken(user, jwtSecret);

    // Return user data (without password hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    return jsonResponse({ user: userWithoutPassword }, 200, {
      'Set-Cookie': createAuthCookie(token),
    });

  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
