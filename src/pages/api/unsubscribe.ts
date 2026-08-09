import type { APIRoute } from 'astro';
import { jsonResponse } from '../../lib/api';
import { csrfErrorResponse, isSameOriginRequest, validateEmail } from '../../lib/auth';
import { unsubscribeFromNewsletter } from '../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

interface UnsubscribeBody {
  email?: unknown;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isSameOriginRequest(request)) return csrfErrorResponse();

    const limit = checkRateLimit({ key: 'newsletter:unsubscribe', limit: 10, windowMs: 60 * 60 * 1000, request });
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    let body: UnsubscribeBody;
    try {
      body = await request.json() as UnsubscribeBody;
    } catch {
      return jsonResponse({ success: false, message: 'Invalid JSON body' }, 400);
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !validateEmail(email)) {
      return jsonResponse({ success: false, message: 'Invalid email format' }, 400);
    }

    await unsubscribeFromNewsletter(email);

    // Keep this response identical whether the address existed or not.
    return jsonResponse({ success: true, message: 'Unsubscribed successfully' }, 200);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return jsonResponse({ success: false, message: 'Server error' }, 500);
  }
};
