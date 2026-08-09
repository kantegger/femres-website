import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../lib/api';
import { clearAuthCookie, csrfErrorResponse, isSameOriginRequest } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return csrfErrorResponse();
  }

  return jsonResponse({ success: true }, 200, {
    'Set-Cookie': clearAuthCookie(),
  });
};
