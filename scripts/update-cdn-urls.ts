/**
 * 批量更新资源 URL 到 R2 CDN
 * 将 /images/ 和 /music/ 替换为 https://media.femres.org/images/ 和 https://media.femres.org/music/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CDN_BASE = 'https://media.femres.org';
const CONTENT_DIR = join(process.cwd(), 'src/content');

let updatedCount = 0;
let skippedCount = 0;
let totalFiles = 0;

// 处理单个文件
function processFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // 替换 /images/ 为 CDN URL
    if (content.includes('/images/')) {
      content = content.replace(/\/images\//g, `${CDN_BASE}/images/`);
      modified = true;
    }

    // 替换 /music/ 为 CDN URL
    if (content.includes('/music/')) {
      content = content.replace(/\/music\//g, `${CDN_BASE}/music/`);
      modified = true;
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error);
    return false;
  }
}

// 递归遍历目录
function walkDirectory(dir: string, callback: (filePath: string) => void) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (stat.isFile() && file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('   更新资源 URL 到 R2 CDN');
  console.log('========================================');
  console.log(`CDN Base: ${CDN_BASE}`);
  console.log(`Content Dir: ${CONTENT_DIR}`);
  console.log('');

  console.log('开始扫描并更新文件...');

  walkDirectory(CONTENT_DIR, (filePath) => {
    totalFiles++;
    if (processFile(filePath)) {
      updatedCount++;
      console.log(`✅ ${filePath}`);
    } else {
      skippedCount++;
    }
  });

  console.log('');
  console.log('========================================');
  console.log('更新完成汇总');
  console.log('========================================');
  console.log(`📄 总文件数: ${totalFiles}`);
  console.log(`✅ 已更新: ${updatedCount} 个文件`);
  console.log(`⏭️  已跳过: ${skippedCount} 个文件`);
  console.log('');
  console.log('资源现在通过 CDN 访问:');
  console.log(`  ${CDN_BASE}/images/...`);
  console.log(`  ${CDN_BASE}/music/...`);
}

main().catch(err => {
  console.error('未处理的错误:', err);
  process.exit(1);
});
