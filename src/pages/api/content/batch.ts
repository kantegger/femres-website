import type { APIRoute } from 'astro';
import {
  isContentForLocale,
  isContentType,
  getNormalizedContent,
  type ContentType,
  type NormalizedContent,
} from '../../../lib/content';
import { jsonResponse } from '../../../lib/api';
import type { Locale } from '../../../i18n';

export const prerender = false;

const supportedLocales = ['zh-CN', 'en', 'zh-TW', 'ja', 'fr'] as const satisfies readonly Locale[];
const MAX_BATCH_SIZE = 100;

interface BatchRequestBody {
  ids?: unknown;
  locale?: unknown;
}

function parseContentId(id: string): { contentType: ContentType; slug: string } | null {
  const separatorIndex = id.indexOf('-');
  if (separatorIndex <= 0) {
    return null;
  }

  const contentType = id.slice(0, separatorIndex);
  const slug = id.slice(separatorIndex + 1);

  if (!isContentType(contentType) || !slug) {
    return null;
  }

  return { contentType, slug };
}

function serializeContent(item: NormalizedContent, id: string) {
  return {
    id,
    title: item.title,
    author: item.author,
    description: item.description,
    type: item.contentType,
    slug: item.cleanSlug,
    coverImage: item.image,
    publishDate: item.date.toISOString(),
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as BatchRequestBody;

    if (!Array.isArray(body.ids)) {
      return jsonResponse({ error: 'ids must be an array' }, 400);
    }

    const ids = [...new Set(body.ids.filter((id): id is string => typeof id === 'string'))]
      .slice(0, MAX_BATCH_SIZE);
    const locale = typeof body.locale === 'string' && supportedLocales.includes(body.locale as Locale)
      ? body.locale as Locale
      : 'zh-CN';

    const content = await getNormalizedContent();
    const exactMatches = new Map(
      content.map((item) => [`${item.contentType}-${item.slug}`, item]),
    );
    const localeCleanMatches = new Map(
      content
        .filter((item) => isContentForLocale(item.slug, locale))
        .map((item) => [`${item.contentType}-${item.cleanSlug}`, item]),
    );
    const cleanMatches = new Map(
      content.map((item) => [`${item.contentType}-${item.cleanSlug}`, item]),
    );

    const items = ids.flatMap((id) => {
      const parsed = parseContentId(id);
      if (!parsed) {
        return [];
      }

      const key = `${parsed.contentType}-${parsed.slug}`;
      const item = exactMatches.get(key)
        || localeCleanMatches.get(key)
        || cleanMatches.get(key);

      return item ? [serializeContent(item, id)] : [];
    });

    return jsonResponse({ items }, 200, {
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    console.error('Batch content API error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
