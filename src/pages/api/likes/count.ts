import type { APIRoute } from 'astro';
import { jsonResponse, validateRouteId } from '../../../lib/api';
import { getLikeCount, getLikeCounts } from '../../../lib/db';

const MAX_BATCH_SIZE = 50;

export const GET: APIRoute = async ({ url }) => {
  try {
    const contentIds = Array.from(new Set(url.searchParams.getAll('contentIds')));
    if (contentIds.length > 0) {
      if (contentIds.length > MAX_BATCH_SIZE) {
        return jsonResponse({ error: `A maximum of ${MAX_BATCH_SIZE} contentIds is allowed` }, 400);
      }
      for (const contentId of contentIds) {
        const validationError = validateRouteId(contentId, 'contentIds');
        if (validationError) return validationError;
      }

      const counts = await getLikeCounts(contentIds);
      return jsonResponse({ counts }, 200, {
        'Cache-Control': 'public, max-age=60',
      });
    }

    const requestedContentId = url.searchParams.get('contentId');

    const validationError = validateRouteId(
      requestedContentId ?? undefined,
      'contentId',
    );
    if (validationError) return validationError;
    if (!requestedContentId) {
      return jsonResponse({ error: 'contentId is required' }, 400);
    }

    const contentId = requestedContentId;
    const count = await getLikeCount(contentId);

    return jsonResponse({ contentId, count }, 200, {
      'Cache-Control': 'public, max-age=60',
    });

  } catch (error) {
    console.error('Error fetching likes count:', error);
    return jsonResponse({
      error: 'Internal server error',
      contentId: url.searchParams.get('contentId'),
      count: 0
    }, 500);
  }
};
