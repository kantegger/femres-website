/**
 * 同步电影海报图到 R2 并更新电影 md 的 posterImage
 *
 * 约定：
 * 1. 将图片放到 `film-cover-drop/` 目录（支持子目录）。
 * 2. 文件名建议使用 slug：`the-substance-2024.jpg` 或 `the-substance-2024-en.jpg`。
 * 3. 运行：`npm run sync:film-posters`。
 * 4. 裁切：加 `--crop`（固定裁切到 800x1200）。
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

const CDN_BASE = 'https://media.femres.org/images/films';
const DROP_DIR = join(process.cwd(), 'film-cover-drop');
const FILM_DIR = join(process.cwd(), 'src/content/films');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const LOCALE_SUFFIXES = ['en', 'fr', 'ja', 'tw', 'zh', 'zh-tw', 'zh-cn'];
const CROPPED_SIZE = { width: 800, height: 1200 };
const PY_CROP_SCRIPT = join(process.cwd(), 'scripts', 'crop-to-400x600.py');

interface FilmMeta {
  path: string;
  fileBase: string;
  baseNoLocale: string;
  posterImage: string;
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
const cropTo800x1200 = args.has('--crop') || args.has('--crop-800x1200');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'femres';

if (!existsSync(DROP_DIR)) {
  console.error(`❌ 找不到图片上传目录: ${DROP_DIR}`);
  process.exit(1);
}

if (!existsSync(FILM_DIR)) {
  console.error(`❌ 找不到电影内容目录: ${FILM_DIR}`);
  process.exit(1);
}

if (!existsSync(PY_CROP_SCRIPT) && cropTo800x1200) {
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

function stripLocaleSuffix(name: string): string {
  const lower = name.toLowerCase();
  const suffix = LOCALE_SUFFIXES.find((s) => lower.endsWith(`-${s}`));
  return suffix ? name.slice(0, name.length - suffix.length - 1) : name;
}

function getFrontmatter(raw: string): string {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

function extractPosterImage(text: string): string {
  const m = text.match(/^posterImage:\s*["']([^"']+)["']/m);
  return m ? m[1] : '';
}

function updatePosterImage(raw: string, nextUrl: string): string {
  if (raw.includes(`posterImage: "${nextUrl}"`) || raw.includes(`posterImage: '${nextUrl}'`)) return raw;

  if (/^posterImage:\s*["'][^"']*["']/m.test(raw)) {
    return raw.replace(/^posterImage:\s*["'][^"']*["']/m, `posterImage: "${nextUrl}"`);
  }

  const fmStart = raw.startsWith('---');
  if (!fmStart) return raw;
  const fmEnd = raw.indexOf('\n---', 3);
  if (fmEnd === -1) return raw;

  return `${raw.slice(0, fmEnd)}\nposterImage: "${nextUrl}"${raw.slice(fmEnd)}`;
}

function isImageFile(file: string): boolean {
  return IMAGE_EXTS.has(extname(file).toLowerCase());
}

function parseArguments() {
  console.log('========================================');
  console.log('   电影海报同步到 R2');
  console.log('========================================');
  console.log(`Bucket: ${R2_BUCKET_NAME}`);
  console.log(`Drop Dir: ${DROP_DIR}`);
  console.log(`Dry Run: ${isDryRun}`);
  console.log(`Force Upload: ${forceUpload}`);
  console.log(`Keep Local Files: ${keepLocal}`);
  console.log(`Crop 800x1200: ${cropTo800x1200}`);
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
    tempUploadDir = mkdtempSync(join(tmpdir(), 'femres-film-cover-'));
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
  if (!cropTo800x1200) return null;

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

function loadFilmIndex() {
  const files = readdirSync(FILM_DIR).filter((f) => f.endsWith('.md')).map((file) => {
    const full = join(FILM_DIR, file);
    const raw = readFileSync(full, 'utf-8');
    const base = basename(file, '.md');
    const front = getFrontmatter(raw);

    return {
      path: full,
      fileBase: base,
      baseNoLocale: stripLocaleSuffix(base),
      posterImage: extractPosterImage(front),
    };
  });

  const byBase = new Map<string, FilmMeta[]>();
  const byNoLocaleBase = new Map<string, FilmMeta[]>();

  for (const item of files) {
    const arr = byBase.get(item.fileBase) || [];
    arr.push(item);
    byBase.set(item.fileBase, arr);

    const nl = byNoLocaleBase.get(item.baseNoLocale) || [];
    nl.push(item);
    byNoLocaleBase.set(item.baseNoLocale, nl);
  }

  return { files, byBase, byNoLocaleBase };
}

function resolveTargets(stem: string, films: ReturnType<typeof loadFilmIndex>) {
  const targets = new Map<string, FilmMeta>();

  const addList = (list?: FilmMeta[]) => {
    if (!list) return;
    for (const item of list) {
      targets.set(item.path, item);
    }
  };

  addList(films.byBase.get(stem));
  addList(films.byNoLocaleBase.get(stem));
  addList(films.byNoLocaleBase.get(stripLocaleSuffix(stem)));

  if (targets.size > 0) {
    return Array.from(targets.values());
  }

  // 宽松匹配：前缀匹配（处理带年份/语言后缀的别名）
  const fuzzy = films.files.filter((item) => {
    return (
      item.fileBase === stem ||
      item.fileBase.startsWith(`${stem}-`) ||
      item.baseNoLocale === stripLocaleSuffix(stem)
    );
  });

  const dedup = new Map<string, FilmMeta>();
  for (const i of fuzzy) dedup.set(i.path, i);
  return Array.from(dedup.values());
}

async function main() {
  parseArguments();

  const films = loadFilmIndex();
  const dropFiles = walkFiles(DROP_DIR);

  if (!dropFiles.length) {
    console.log('⚠️  目录下暂无图片文件。请先放入文件再重试。');
    console.log(`目录: ${DROP_DIR}`);
    process.exit(0);
  }

  console.log(`检测到 ${dropFiles.length} 张候选图片`);
  console.log('');

  for (const file of dropFiles) {
    const stem = basename(file).replace(extname(file), '');
    const fileName = basename(file);

    const preparedPath = cropTo800x1200 ? cropImageForUpload(file) : null;

    if (cropTo800x1200 && !preparedPath) {
      failedUpload++;
      unmatched.push(fileName);
      continue;
    }

    const sourceForUpload = preparedPath || file;
    const targets = resolveTargets(stem, films);

    if (!targets.length) {
      unmatched.push(fileName);
      console.log(`⚠️  未匹配: ${fileName}`);
      if (preparedPath) unlinkSync(preparedPath);
      continue;
    }

    const r2Key = `images/films/${fileName}`;
    const cdnUrl = `${CDN_BASE}/${fileName}`;
    const uploadedThis = await uploadFile(sourceForUpload, r2Key);

    if (uploadedThis) {
      console.log(`✅ 上传: ${fileName} -> ${cdnUrl}`);
    } else {
      console.log(`⏭️  已跳过上传: ${fileName}`);
    }

    for (const target of targets) {
      const raw = readFileSync(target.path, 'utf-8');
      const next = `posterImage: "${cdnUrl}"`;

      if (raw.includes(next)) {
        skippedFiles++;
        continue;
      }

      const updated = updatePosterImage(raw, cdnUrl);
      if (updated !== raw) {
        if (!isDryRun) {
          writeFileSync(target.path, updated, 'utf-8');
        }
        updatedFiles++;
        console.log(`  ↳ 更新 ${basename(target.path)} posterImage`);
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
    console.log(`❌ 失败: ${failedUpload}`);
  }
  console.log(`🧾 已更新 md: ${updatedFiles}`);
  console.log(`↪️  命中已有链接: ${skippedFiles}`);
  console.log('');

  if (unmatched.length > 0) {
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
