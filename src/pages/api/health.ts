// 数据库健康检查 API
// 用于测试 Vercel 上的数据库连接
import { sql } from '../../lib/db';

export async function GET() {
  try {
    // 测试数据库连接
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;

    // 测试读取用户数量
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;

    return Response.json({
      status: 'ok',
      database: 'connected',
      current_time: result[0].current_time,
      pg_version: result[0].pg_version,
      user_count: userCount[0].count,
      env: process.env.VERCEL_ENV || 'development'
    });
  } catch (error: any) {
    return Response.json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      env: process.env.VERCEL_ENV || 'development'
    }, { status: 500 });
  }
}
