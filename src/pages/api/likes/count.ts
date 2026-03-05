import type { APIRoute } from 'astro';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  prepare: false
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const contentId = url.searchParams.get('contentId');

    if (!contentId) {
      return new Response(JSON.stringify({ error: 'contentId is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 查询实际点赞数
    const result = await sql`
      SELECT COUNT(*) as count
      FROM user_interactions
      WHERE content_id = ${contentId} AND interaction_type = 'like'
    `;

    const count = Number(result[0]?.count) || 0;

    return new Response(JSON.stringify({
      contentId,
      count
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // 缓存1分钟
      }
    });

  } catch (error) {
    console.error('Error fetching likes count:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      contentId: url.searchParams.get('contentId'),
      count: 0
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};