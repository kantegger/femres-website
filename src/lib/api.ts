export const MAX_ROUTE_ID_LENGTH = 256;

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function validateRouteId(
  id: string | undefined,
  label: string,
): Response | null {
  if (!id) {
    return jsonResponse({ error: `${label} is required` }, 400);
  }

  if (id.length > MAX_ROUTE_ID_LENGTH) {
    return jsonResponse({ error: `${label} is too long` }, 400);
  }

  return null;
}
