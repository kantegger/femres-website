/**
 * Cloudflare R2 上传脚本
 * 将 public/images 和 public/music 上传到 R2
 *
 * 使用前需要设置环境变量:
 * R2_ACCOUNT_ID=your_account_id
 * R2_ACCESS_KEY_ID=your_access_key
 * R2_SECRET_ACCESS_KEY=your_secret_key
 * R2_BUCKET_NAME=your_bucket_name
 *
 * 运行: npm run upload:r2
 */

import 'dotenv/config';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import mime from 'mime';

// R2 配置
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'femres-media';

// R2 endpoint
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// 创建 S3 客户端（兼容 R2）
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// 文件上传计数器
let uploadedCount = 0;
let skippedCount = 0;
let errorCount = 0;
let totalSize = 0;

// 检查文件是否已存在
async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: key,
      MaxKeys: 1,
    });
    const response = await r2Client.send(command);
    return (response.Contents?.length || 0) > 0;
  } catch {
    return false;
  }
}

// 上传单个文件
async function uploadFile(
  localPath: string,
  r2Key: string,
  force: boolean = false
): Promise<boolean> {
  try {
    // 检查文件是否已存在
    if (!force && await fileExists(r2Key)) {
      skippedCount++;
      return false;
    }

    const content = readFileSync(localPath);
    const contentType = mime.getType(localPath) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: content,
      ContentType: contentType,
      // 设置缓存头
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await r2Client.send(command);
    uploadedCount++;
    totalSize += content.length;

    console.log(`✅ ${r2Key}`);
    return true;
  } catch (error: any) {
    errorCount++;
    console.error(`❌ ${r2Key}: ${error.message}`);
    return false;
  }
}

// 递归上传目录
async function uploadDirectory(
  localDir: string,
  r2Prefix: string,
  force: boolean = false
): Promise<void> {
  const files = readdirSync(localDir);

  for (const file of files) {
    const localPath = join(localDir, file);
    const stat = statSync(localPath);

    if (stat.isDirectory()) {
      await uploadDirectory(localPath, `${r2Prefix}${file}/`, force);
    } else if (stat.isFile()) {
      // 跳过 README 等非媒体文件
      if (file === 'README.md' || file === '.DS_Store') {
        continue;
      }
      const r2Key = `${r2Prefix}${file}`;
      await uploadFile(localPath, r2Key, force);
    }
  }
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('   Cloudflare R2 上传工具');
  console.log('========================================');
  console.log(`Bucket: ${R2_BUCKET_NAME}`);
  console.log(`Endpoint: ${R2_ENDPOINT}`);
  console.log(`Custom Domain: https://media.femres.org`);
  console.log('');

  // 检查环境变量
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ 错误: 缺少 R2 凭证环境变量');
    console.log('请在 .env 中设置:');
    console.log('R2_ACCOUNT_ID=your_account_id');
    console.log('R2_ACCESS_KEY_ID=your_access_key');
    console.log('R2_SECRET_ACCESS_KEY=your_secret_key');
    console.log('R2_BUCKET_NAME=femres-media (可选)');
    process.exit(1);
  }

  const publicDir = join(process.cwd(), 'public');
  const forceUpload = process.argv.includes('--force');

  console.log('开始上传...');
  console.log('');

  // 上传 images 目录
  const imagesDir = join(publicDir, 'images');
  if (statSync(imagesDir).isDirectory()) {
    console.log('--- 上传 images/ ---');
    await uploadDirectory(imagesDir, 'images/', forceUpload);
  }

  // 上传 music 目录
  const musicDir = join(publicDir, 'music');
  if (statSync(musicDir).isDirectory()) {
    console.log('');
    console.log('--- 上传 music/ ---');
    await uploadDirectory(musicDir, 'music/', forceUpload);
  }

  // 上传根目录的 SVG 文件
  console.log('');
  console.log('--- 上传根目录 SVG ---');
  const rootFiles = readdirSync(publicDir);
  for (const file of rootFiles) {
    if (file.endsWith('.svg')) {
      await uploadFile(join(publicDir, file), file, forceUpload);
    }
  }

  console.log('');
  console.log('========================================');
  console.log('上传完成汇总');
  console.log('========================================');
  console.log(`✅ 已上传: ${uploadedCount} 个文件`);
  console.log(`⏭️  已跳过: ${skippedCount} 个文件`);
  if (errorCount > 0) {
    console.log(`❌ 失败: ${errorCount} 个文件`);
  }
  console.log(`📦 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
  console.log('访问地址:');
  console.log(`  https://media.femres.org/images/...`);
  console.log(`  https://media.femres.org/music/...`);
}

main().catch(err => {
  console.error('未处理的错误:', err);
  process.exit(1);
});
