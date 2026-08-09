/**
 * 同步书籍封面图到 R2 并更新书籍 md 链接
 *
 * 约定：
 * 1. 将图片放到 `book-cover-drop/` 目录（支持子目录）。
 * 2. 文件名支持以下命名方式：
 *    - 完整 ISBN：`9780520397675.jpg`
 *    - 与内容文件名一致：`smart-wife-en.jpg` 或 `smart-wife.jpg`
 * 3. 运行：`npm run sync:book-covers`。
 * 4. 如需自动裁切：加 `--crop`（会先裁切到 400x600 再上传）。
 */

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from 'fs';
import { join, extname, basename } from 'path';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import mime from 'mime';
import { loadLocalEnv } from './load-env';

loadLocalEnv();

const CDN_BASE = 'https://media.femres.org/images/books';
const DROP_DIR = join(process.cwd(), 'book-cover-drop');
const BOOK_DIR = join(process.cwd(), 'src/content/books');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const LOCALE_SUFFIXES = ['en', 'fr', 'ja', 'tw', 'zh', 'zh-tw', 'zh-cn'];
const CROPPED_SIZE = { width: 400, height: 600 };
const PY_CROP_SCRIPT = join(process.cwd(), 'scripts', 'crop-to-400x600.py');

interface BookMeta {
  path: string;
  fileBase: string;
  baseNoLocale: string;
  isbn?: string;
  coverImage: string;
}

let uploaded = 0;
let skippedUpload = 0;
let failedUpload = 0;
let updatedFiles = 0;
let skippedFiles = 0;
let unmatched: string[] = [];
let tempUploadDir: string | null = null;

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const forceUpload = args.has('--force');
const keepLocal = args.has('--keep');
const cropTo400x600 = args.has('--crop') || args.has('--crop-400x600');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'femres';

if (!existsSync(DROP_DIR)) {
  console.error(`❌ 找不到图片上传目录: ${DROP_DIR}`);
  process.exit(1);
}

if (!existsSync(BOOK_DIR)) {
  console.error(`❌ 找不到书籍内容目录: ${BOOK_DIR}`);
  process.exit(1);
}
if (!existsSync(PY_CROP_SCRIPT) && cropTo400x600) {
  console.error(`❌ 找不到裁切脚本: ${PY_CROP_SCRIPT}`);
  process.exit(1);
}

let r2Client: S3Client | null = null;

function ensureR2Client() {
  if (r2Client) return r2Client;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('缺少 R2 凭证环境变量');
  }

  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return r2Client;
}

function normalizeIsbn(value: string): string {
  return value.replace(/[^0-9Xx]/g, '').toUpperCase();
}

function extractIsbn(text: string): string | undefined {
  const m = text.match(/^isbn:\s*"([^\"]+)"/m);
  if (!m) return undefined;
  return normalizeIsbn(m[1]);
}

function extractCoverImage(text: string): string {
  const m = text.match(/^coverImage:\s*["']([^"']+)["']/m);
  return m ? m[1] : '';
}

function stripLocaleSuffix(name: string): string {
  const lower = name.toLowerCase();
  const suffix = LOCALE_SUFFIXES.find((s) => lower.endsWith(`-${s}`));
  return suffix ? name.slice(0, name.length - suffix.length - 1) : name;
}

function getFrontmatter(raw: string): string {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

function updateCoverImage(raw: string, nextUrl: string): string {
  if (raw.includes(`coverImage: "${nextUrl}"`) || raw.includes(`coverImage: '${nextUrl}'`)) return raw;
  if (/^coverImage:\s*["'][^"']*["']/m.test(raw)) {
    return raw.replace(/^coverImage:\s*["'][^"']*["']/m, `coverImage: "${nextUrl}"`);
  }

  const fmStart = raw.startsWith('---');
  if (!fmStart) return raw;
  const fmEnd = raw.indexOf('\n---', 3);
  if (fmEnd === -1) return raw;
  return `${raw.slice(0, fmEnd)}\ncoverImage: "${nextUrl}"${raw.slice(fmEnd)}`;
}

function isImageFile(file: string): boolean {
  return IMAGE_EXTS.has(extname(file).toLowerCase());
}

function parseArguments() {
  console.log('========================================');
  console.log('   书籍封面图片同步到 R2');
  console.log('========================================');
  console.log(`Bucket: ${R2_BUCKET_NAME}`);
  console.log(`Drop Dir: ${DROP_DIR}`);
  console.log(`Dry Run: ${isDryRun}`);
  console.log(`Force Upload: ${forceUpload}`);
  console.log(`Keep Local Files: ${keepLocal}`);
  console.log(`Crop 400x600: ${cropTo400x600}`);
  console.log('');
}

function getPythonCommand(): string {
  const py3 = spawnSync('python3', ['-V'], { encoding: 'utf8' });
  if (py3.status === 0) return 'python3';

  const py = spawnSync('python', ['-V'], { encoding: 'utf8' });
  if (py.status === 0) return 'python';

  throw new Error('未检测到 python3/python。请先安装 Python。');
}

function getTempUploadPath(fileName: string): string {
  if (!tempUploadDir) {
    tempUploadDir = mkdtempSync(join(tmpdir(), 'femres-book-cover-'));
  }

  return join(tempUploadDir, fileName);
}

function ensureTempUploadDir() {
  if (!tempUploadDir) {
    getTempUploadPath('seed');
  }

  if (tempUploadDir) {
    mkdirSync(tempUploadDir, { recursive: true });
  }
}

function cleanupTempUploadDir() {
  if (!tempUploadDir) return;

  try {
    rmSync(tempUploadDir, { recursive: true, force: true });
  } catch {}
  tempUploadDir = null;
}

function cropImageForUpload(filePath: string): string | null {
  if (!cropTo400x600) return null;

  const fileName = basename(filePath);
  ensureTempUploadDir();

  const ext = extname(fileName);
  const stem = fileName.slice(0, -ext.length);
  const outPath = getTempUploadPath(`${stem}-${CROPPED_SIZE.width}x${CROPPED_SIZE.height}${ext}`);

  const pythonCmd = getPythonCommand();
  const result = spawnSync(
    pythonCmd,
    [
      PY_CROP_SCRIPT,
      filePath,
      outPath,
      String(CROPPED_SIZE.width),
      String(CROPPED_SIZE.height),
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0 || result.error) {
    console.error(`❌ 裁切失败: ${fileName}`);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return null;
  }

  return outPath;
}

async function fileExists(key: string): Promise<boolean> {
  try {
    const response = await ensureR2Client().send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: key,
        MaxKeys: 1,
      }),
    );
    return (response.Contents?.length || 0) > 0;
  } catch {
    return false;
  }
}

async function uploadFile(localPath: string, key: string): Promise<boolean> {
  if (isDryRun) {
    return true;
  }

  if (!forceUpload && (await fileExists(key))) {
    skippedUpload++;
    return false;
  }

  try {
    const body = readFileSync(localPath);
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mime.getType(localPath) || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await ensureR2Client().send(command);
    uploaded++;
    return true;
  } catch {
    failedUpload++;
    return false;
  }
}

function walkFiles(dir: string): string[] {
  const result: string[] = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const full = join(dir, item.name);
    if (item.isDirectory()) {
      result.push(...walkFiles(full));
    } else if (item.isFile() && isImageFile(item.name)) {
      result.push(full);
    }
  }

  return result;
}

function loadBookIndex(): {
  files: BookMeta[];
  byBase: Map<string, BookMeta[]>;
  byNoLocaleBase: Map<string, BookMeta[]>;
  byIsbn: Map<string, BookMeta[]>;
} {
  const files = readdirSync(BOOK_DIR).filter((f) => f.endsWith('.md')).map((file) => {
    const full = join(BOOK_DIR, file);
    const raw = readFileSync(full, 'utf-8');
    const base = basename(file, '.md');
    const front = getFrontmatter(raw);

    return {
      path: full,
      fileBase: base,
      baseNoLocale: stripLocaleSuffix(base),
      isbn: extractIsbn(front),
      coverImage: extractCoverImage(raw),
    };
  });

  const byBase = new Map<string, BookMeta[]>();
  const byNoLocaleBase = new Map<string, BookMeta[]>();
  const byIsbn = new Map<string, BookMeta[]>();

  for (const item of files) {
    const arr = byBase.get(item.fileBase) || [];
    arr.push(item);
    byBase.set(item.fileBase, arr);

    const nl = byNoLocaleBase.get(item.baseNoLocale) || [];
    nl.push(item);
    byNoLocaleBase.set(item.baseNoLocale, nl);

    if (item.isbn) {
      const arrIsbn = byIsbn.get(item.isbn) || [];
      arrIsbn.push(item);
      byIsbn.set(item.isbn, arrIsbn);
    }
  }

  return { files, byBase, byNoLocaleBase, byIsbn };
}

function resolveTargets(stem: string, books: ReturnType<typeof loadBookIndex>) {
  const digitsOnly = normalizeIsbn(stem);
  if (/^\d{10}(?:\d)?$/.test(digitsOnly) || /^\d{13}$/.test(digitsOnly)) {
    const byIsbn = books.byIsbn.get(digitsOnly);
    if (byIsbn?.length) return byIsbn;
  }

  const exact = books.byBase.get(stem);
  if (exact?.length) return exact;

  const noLocale = books.byNoLocaleBase.get(stem);
  if (noLocale?.length) return noLocale;

  const withLocaleStripped = books.byNoLocaleBase.get(stripLocaleSuffix(stem));
  if (withLocaleStripped?.length) return withLocaleStripped;

  // 兜底：宽松匹配（例如图片名与 slug 的前缀匹配）
  const fuzzy = books.files.filter((item) =>
    item.fileBase === stem || item.fileBase.startsWith(`${stem}-`) || item.baseNoLocale === stripLocaleSuffix(stem),
  );

  // 去重
  const dedup = new Map<string, BookMeta>();
  for (const i of fuzzy) dedup.set(i.path, i);
  return Array.from(dedup.values());
}

async function main() {
  parseArguments();

  const books = loadBookIndex();
  const dropFiles = walkFiles(DROP_DIR);

  if (!dropFiles.length) {
    console.log('⚠️  目录下暂无图片文件。请先放入文件再重试。');
    console.log(`目录: ${DROP_DIR}`);
    process.exit(0);
  }

  console.log(`检测到 ${dropFiles.length} 张候选图片`);
  console.log('');

  const usedEntries = new Set<string>();

  for (const file of dropFiles) {
    const stem = basename(file).replace(extname(file), '');
    const fileName = basename(file);
    const preparedPath = cropTo400x600 ? cropImageForUpload(file) : null;

    if (cropTo400x600 && !preparedPath) {
      failedUpload++;
      unmatched.push(fileName);
      continue;
    }

    const sourceForUpload = preparedPath || file;

    const targets = resolveTargets(stem, books);
    if (!targets.length) {
      unmatched.push(fileName);
      console.log(`⚠️  未匹配: ${fileName}`);
      if (preparedPath) {
        unlinkSync(preparedPath);
      }
      continue;
    }

    const r2Key = `images/books/${fileName}`;
    const cdnUrl = `${CDN_BASE}/${fileName}`;

    const uploadedThis = await uploadFile(sourceForUpload, r2Key);
    if (uploadedThis) {
      console.log(`✅ 上传: ${fileName} -> ${cdnUrl}`);
    } else {
      console.log(`⏭️  已跳过上传: ${fileName}`);
    }

    for (const target of targets) {
      const raw = readFileSync(target.path, 'utf-8');
      const next = `coverImage: "${cdnUrl}"`;
      if (raw.includes(next)) {
        skippedFiles++;
        continue;
      }

      const updated = updateCoverImage(raw, cdnUrl);
      if (updated !== raw) {
        if (!isDryRun) {
          writeFileSync(target.path, updated, 'utf-8');
        }
        usedEntries.add(target.path);
        updatedFiles++;
        console.log(`  ↳ 更新 ${basename(target.path)} coverImage`);
      } else {
        skippedFiles++;
      }
    }

    if (!isDryRun && !keepLocal && uploadedThis) {
      unlinkSync(file);
    }

    if (preparedPath) {
      unlinkSync(preparedPath);
    }
  }

  console.log('');
  console.log('========================================');
  console.log('同步完成');
  console.log('========================================');
  console.log(`📤 已上传: ${uploaded}`);
  console.log(`⏭️  跳过上传: ${skippedUpload}`);
  if (failedUpload > 0) {
    console.log(`❌ 上传失败: ${failedUpload}`);
  }
  console.log(`🧾 已更新 md: ${updatedFiles}`);
  console.log(`↪️  命中已有链接: ${skippedFiles}`);
  if (!isDryRun) {
    console.log(`🧹 已处理文件: ${usedEntries.size} 个书籍条目`);
  }
  if (unmatched.length > 0) {
    console.log('');
    console.log('未匹配文件（请按文件名重命名后重跑）:');
    unmatched.forEach((name) => console.log(`  - ${name}`));
  }

  cleanupTempUploadDir();

  console.log('');
  console.log('可直接访问:');
  console.log(`  ${CDN_BASE}/<filename>`);
}

main().catch((err) => {
  console.error('未处理的错误:', err);
  process.exit(1);
});
