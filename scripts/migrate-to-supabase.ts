/**
 * 数据迁移脚本：从 Neon 迁移到 Supabase
 *
 * 使用方法：
 * 1. 确保 .env 中同时有 NEON_DATABASE_URL (旧) 和 DATABASE_URL (新/Supabase)
 * 2. 运行: node scripts/migrate-to-supabase.js
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// 读取 .env 文件
function loadEnv(): Record<string, string> {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key] = value;
      }
    }
  }

  return env;
}

// 加载环境变量
const env = loadEnv();

const NEON_DATABASE_URL = env.NEON_DATABASE_URL;
const DATABASE_URL = env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error('❌ 错误: .env 中缺少 NEON_DATABASE_URL');
  console.log('请在 .env 中添加:');
  console.log('NEON_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-[...].neon.tech/neondb?sslmode=require');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ 错误: .env 中缺少 DATABASE_URL');
  console.log('请在 .env 中添加:');
  console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[...].supabase.co:5432/postgres');
  process.exit(1);
}

// Neon 连接 (源数据库)
const neonSql = postgres(NEON_DATABASE_URL, {
  ssl: true,
  prepare: false,
  max: 1
});

// Supabase 连接 (目标数据库)
const supabaseSql = postgres(DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false  // Supabase pooler 使用自签名证书
  },
  prepare: false,
  max: 1
});

interface TableRow {
  [key: string]: any;
}

// 迁移配置：按顺序迁移表（考虑外键依赖）
const MIGRATION_PLAN = [
  { table: 'users', columns: ['id', 'username', 'email', 'password_hash', 'avatar_url', 'created_at', 'updated_at'] },
  { table: 'user_interactions', columns: ['id', 'user_id', 'content_id', 'content_type', 'interaction_type', 'created_at'] },
  { table: 'comments', columns: ['id', 'user_id', 'content_id', 'content_type', 'content', 'parent_id', 'likes_count', 'created_at', 'updated_at'] },
  { table: 'comment_likes', columns: ['id', 'comment_id', 'user_id', 'created_at'] },
  { table: 'newsletter_subscribers', columns: ['id', 'email', 'source', 'created_at'] }
];

async function getRowCount(sql: postgres.Sql<{}>, table: string): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
  return Number(result[0].count);
}

async function migrateTable(tableName: string, columns: string[]): Promise<{ success: boolean; migrated: number; error?: string }> {
  console.log(`\n========================================`);
  console.log(`开始迁移表: ${tableName}`);
  console.log(`========================================`);

  try {
    // 从 Neon 读取所有数据
    console.log(`从 Neon 读取 ${tableName} 数据...`);
    const neonData = await neonSql.unsafe<TableRow[]>(`SELECT ${columns.join(', ')} FROM ${tableName}`);

    if (neonData.length === 0) {
      console.log(`表 ${tableName} 没有数据，跳过。`);
      return { success: true, migrated: 0 };
    }

    console.log(`找到 ${neonData.length} 条记录`);

    // 批量插入到 Supabase
    console.log(`写入 Supabase...`);
    let migrated = 0;
    let skipped = 0;

    for (const row of neonData) {
      try {
        // 检查是否已存在（根据主键）
        const existing = await supabaseSql.unsafe(
          `SELECT id FROM ${tableName} WHERE id = $1`,
          [row.id]
        );

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // 插入数据
        const columnsStr = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(col => row[col]);

        await supabaseSql.unsafe(
          `INSERT INTO ${tableName} (${columnsStr}) VALUES (${placeholders})`,
          values
        );
        migrated++;
      } catch (err: any) {
        // 忽略唯一约束冲突
        if (err.code === '23503' || err.code === '23505') {
          skipped++;
        } else {
          throw err;
        }
      }

      // 每 100 条显示进度
      if ((migrated + skipped) % 100 === 0) {
        console.log(`  进度: ${migrated + skipped}/${neonData.length} (已迁移: ${migrated}, 跳过: ${skipped})`);
      }
    }

    console.log(`✅ ${tableName} 迁移完成: ${migrated} 条新记录, ${skipped} 条已存在跳过`);

    // 验证迁移
    const neonCount = await getRowCount(neonSql, tableName);
    const supabaseCount = await getRowCount(supabaseSql, tableName);
    console.log(`  Neon 总数: ${neonCount}, Supabase 总数: ${supabaseCount}`);

    if (neonCount !== supabaseCount) {
      console.log(`⚠️  警告: 记录数不匹配！`);
    }

    return { success: true, migrated };

  } catch (error: any) {
    console.error(`❌ ${tableName} 迁移失败:`, error.message);
    return { success: false, migrated: 0, error: error.message };
  }
}

async function main() {
  console.log('========================================');
  console.log('   Neon → Supabase 数据迁移工具');
  console.log('========================================');

  console.log('\n连接信息:');
  console.log(`  Neon: ${NEON_DATABASE_URL.replace(/:[^:]+@/, ':****@')}`);
  console.log(`  Supabase: ${DATABASE_URL.replace(/:[^:]+@/, ':****@')}`);

  // 测试连接
  try {
    await neonSql`SELECT 1`;
    console.log('\n✅ Neon 连接成功');
  } catch (err: any) {
    console.error('\n❌ Neon 连接失败:', err.message);
    process.exit(1);
  }

  try {
    await supabaseSql`SELECT 1`;
    console.log('✅ Supabase 连接成功');
  } catch (err: any) {
    console.error('❌ Supabase 连接失败:', err.message);
    process.exit(1);
  }

  // 显示迁移前的数据统计
  console.log('\n========================================');
  console.log('迁移前数据统计 (Neon):');
  console.log('========================================');
  for (const { table } of MIGRATION_PLAN) {
    try {
      const count = await getRowCount(neonSql, table);
      console.log(`  ${table}: ${count} 条`);
    } catch {
      console.log(`  ${table}: 表不存在或无法访问`);
    }
  }

  // 确认开始
  console.log('\n按 Ctrl+C 取消，或等待 3 秒后开始迁移...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 执行迁移
  const results: Record<string, any> = {};
  let hasErrors = false;

  for (const { table, columns } of MIGRATION_PLAN) {
    const result = await migrateTable(table, columns);
    results[table] = result;
    if (!result.success) {
      hasErrors = true;
    }
  }

  // 汇总
  console.log('\n========================================');
  console.log('迁移完成汇总');
  console.log('========================================');

  let totalMigrated = 0;
  for (const [table, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`  ✅ ${table}: ${result.migrated} 条`);
      totalMigrated += result.migrated;
    } else {
      console.log(`  ❌ ${table}: ${result.error}`);
    }
  }

  console.log(`\n总计迁移: ${totalMigrated} 条记录`);

  // 关闭连接
  await neonSql.end();
  await supabaseSql.end();

  if (hasErrors) {
    console.log('\n⚠️  部分迁移失败，请检查错误信息');
    process.exit(1);
  } else {
    console.log('\n✅ 所有迁移完成！');
  }
}

main().catch(err => {
  console.error('未处理的错误:', err);
  process.exit(1);
});
