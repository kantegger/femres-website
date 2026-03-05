/**
 * 单个文件上传到 R2 的快捷脚本
 *
 * 使用方法:
 * npm run upload:r2:single <localFilePath> <r2Key>
 *
 * 示例:
 * npm run upload:r2:single public/images/new-book.jpg images/new-book.jpg
 */

import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import mime from 'mime';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'femres';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadSingleFile(localPath: string, r2Key: string) {
  try {
    const content = readFileSync(localPath);
    const contentType = mime.getType(localPath) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: content,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await r2Client.send(command);
    console.log(`✅ 上传成功!`);
    console.log(`\nCDN URL: https://media.femres.org/${r2Key}`);
  } catch (error: any) {
    console.error(`❌ 上传失败: ${error.message}`);
    process.exit(1);
  }
}

// 获取命令行参数
const localPath = process.argv[2];
const r2Key = process.argv[3];

if (!localPath || !r2Key) {
  console.log('用法: npm run upload:r2:single <本地文件路径> <R2存储键>');
  console.log('');
  console.log('示例:');
  console.log('  npm run upload:r2:single public/images/test.jpg images/test.jpg');
  console.log('  npm run upload:r2:single ./assets/photo.jpg music/photo.jpg');
  console.log('');
  console.log('上传后可通过 https://media.femres.org/images/test.jpg 访问');
  process.exit(1);
}

uploadSingleFile(localPath, r2Key);
