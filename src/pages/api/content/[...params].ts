import type { APIRoute } from 'astro';
import {
  collectionToContentType,
  getNormalizedContent,
  resolveCollectionName,
} from '../../../lib/content';
import { jsonResponse } from '../../../lib/api';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { params: urlParams } = params;

    if (!urlParams || typeof urlParams !== 'string') {
      return jsonResponse({ error: 'Invalid parameters' }, 400);
    }

    // Parse the URL parameters: /api/content/[contentType]/[slug]
    const pathParts = urlParams.split('/');
    if (pathParts.length !== 2) {
      return jsonResponse({ error: 'Invalid URL format. Expected: /api/content/[contentType]/[slug]' }, 400);
    }

    const [contentType, slug] = pathParts;

    // Validate content type
    const collectionName = resolveCollectionName(contentType);
    if (!collectionName) {
      return jsonResponse({ error: `Invalid content type: ${contentType}` }, 400);
    }

    const expectedContentType = collectionToContentType[collectionName];
    const content = await getNormalizedContent();
    const normalized = content.find((item) =>
      item.contentType === expectedContentType
      && (item.slug === slug || item.cleanSlug === slug)
    );

    if (!normalized) {
      return jsonResponse({ error: 'Content not found' }, 404);
    }

    const responseData = {
      title: normalized.title,
      author: normalized.author,
      description: normalized.description,
      publishDate: normalized.date.toISOString(),
      coverImage: normalized.image,
      topics: normalized.topics,
      slug: normalized.slug,
      contentType: normalized.contentType
    };

    return jsonResponse(responseData, 200, {
      'Cache-Control': 'public, max-age=3600'
    });

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
