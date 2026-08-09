import type { APIRoute } from 'astro';
import { jsonResponse } from '../../lib/api';
import { csrfErrorResponse, isSameOriginRequest, validateEmail } from '../../lib/auth';
import { subscribeToNewsletter } from '../../lib/db';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

interface SubscribeRequestBody {
    email?: unknown;
    source?: unknown;
}

const DEFAULT_SOURCE = 'book_page';
const MAX_SOURCE_LENGTH = 64;

export const POST: APIRoute = async ({ request }) => {
    try {
        if (!isSameOriginRequest(request)) {
            return csrfErrorResponse();
        }

        const limit = checkRateLimit({
            key: 'newsletter:subscribe',
            limit: 10,
            windowMs: 60 * 60 * 1000,
            request
        });

        if (!limit.allowed) {
            return rateLimitResponse(limit.retryAfter);
        }

        let data: SubscribeRequestBody;
        try {
            data = await request.json() as SubscribeRequestBody;
        } catch {
            return jsonResponse({
                success: false,
                message: 'Invalid JSON body'
            }, 400);
        }

        const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
        const source = typeof data.source === 'string' ? data.source.trim() : DEFAULT_SOURCE;

        if (!email) {
            return jsonResponse({
                success: false,
                message: 'Email is required'
            }, 400);
        }

        if (!validateEmail(email)) {
            return jsonResponse({
                success: false,
                message: 'Invalid email format'
            }, 400);
        }

        if (!source || source.length > MAX_SOURCE_LENGTH) {
            return jsonResponse({
                success: false,
                message: 'Invalid source'
            }, 400);
        }

        const success = await subscribeToNewsletter(email, source);

        if (success) {
            return jsonResponse({
                success: true,
                message: 'Subscribed successfully'
            }, 200);
        } else {
            // Even if it failed (e.g. duplicate), we often want to treat it as success or a soft error
            // But since our DB function catches errors, returning false implies a real DB error usually, 
            // OR it swallowed the conflict. The ON CONFLICT DO NOTHING means it wont error on duplicates.
            // So a false return is likely a connection error.
            return jsonResponse({
                success: false,
                message: 'Subscription failed'
            }, 500);
        }
    } catch (error) {
        console.error('API Error:', error);
        return jsonResponse({
            success: false,
            message: 'Server error'
        }, 500);
    }
}
