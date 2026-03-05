import type { APIRoute } from 'astro';
import { subscribeToNewsletter } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { email, source } = data;

        if (!email) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const success = await subscribeToNewsletter(email, source || 'book_page');

        if (success) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Subscribed successfully'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Even if it failed (e.g. duplicate), we often want to treat it as success or a soft error
            // But since our DB function catches errors, returning false implies a real DB error usually, 
            // OR it swallowed the conflict. The ON CONFLICT DO NOTHING means it wont error on duplicates.
            // So a false return is likely a connection error.
            return new Response(JSON.stringify({
                success: false,
                message: 'Subscription failed'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
