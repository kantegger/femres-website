import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { params: urlParams } = params;

    if (!urlParams || typeof urlParams !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse the URL parameters: /api/content/[contentType]/[slug]
    const pathParts = urlParams.split('/');
    if (pathParts.length !== 2) {
      return new Response(JSON.stringify({ error: 'Invalid URL format. Expected: /api/content/[contentType]/[slug]' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [contentType, slug] = pathParts;

    // Validate content type
    const validTypes = ['books', 'articles', 'films', 'videos', 'podcasts', 'papers'];
    if (!validTypes.includes(contentType) && !validTypes.includes(contentType + 's')) {
      return new Response(JSON.stringify({ error: `Invalid content type: ${contentType}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normalize content type to collection name
    const collectionName = contentType.endsWith('s') ? contentType : contentType + 's';

    try {
      // Get the specific content from the collection
      const collection = await getCollection(collectionName as any);

      // Find content by slug
      const content = collection.find(item => item.slug === slug);

      if (!content) {
        return new Response(JSON.stringify({ error: 'Content not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Return the content data
      const responseData = {
        title: content.data.title,
        author: content.data.author || content.data.director || content.data.speaker,
        description: content.data.description,
        publishDate: content.data.publishDate?.toISOString() || content.data.releaseDate?.toISOString(),
        coverImage: content.data.coverImage || content.data.posterImage || content.data.thumbnail || content.data.featuredImage,
        topics: content.data.topics || [],
        slug: content.slug,
        contentType: collectionName.slice(0, -1) // Remove 's' from collection name
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });

    } catch (collectionError) {
      console.error(`Error accessing collection ${collectionName}:`, collectionError);
      return new Response(JSON.stringify({ error: `Collection ${collectionName} not found` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};