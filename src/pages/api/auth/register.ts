import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../lib/api';
import { createUser, getUserByEmail, getUserByUsername } from '../../../lib/db';
import { authConfigErrorResponse, createAuthCookie, csrfErrorResponse, getJwtSecret, isSameOriginRequest, hashPassword, validateEmail, validateUsername, validatePassword, generateToken } from '../../../lib/auth';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  
  try {
    if (!isSameOriginRequest(request)) {
      return csrfErrorResponse();
    }

    const limit = checkRateLimit({
      key: 'auth:register',
      limit: 5,
      windowMs: 60 * 60 * 1000,
      request
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfter);
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return jsonResponse({ error: 'Username, email, and password are required' }, 400);
    }

    // Validation
    if (!validateUsername(username)) {
      return jsonResponse({
        error: 'Username must be 3-20 characters, alphanumeric and underscore only'
      }, 400);
    }

    if (!validateEmail(email)) {
      return jsonResponse({ error: 'Invalid email format' }, 400);
    }

    if (!validatePassword(password)) {
      return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
    }

    const jwtSecret = getJwtSecret();

    if (!jwtSecret) {
      return authConfigErrorResponse();
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return jsonResponse({ error: 'User with this email already exists' }, 409);
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return jsonResponse({ error: 'Username already taken' }, 409);
    }

    // Create user
    const passwordHash = await hashPassword(password);
    
    const user = await createUser({
      username,
      email,
      password_hash: passwordHash
    });

    // Generate JWT
    const token = await generateToken(user, jwtSecret);

    // Return user data (without password hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    return jsonResponse({ user: userWithoutPassword }, 201, {
      'Set-Cookie': createAuthCookie(token),
    });

  } catch (error) {
    console.error('Register error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
