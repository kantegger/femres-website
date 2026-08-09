import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const vercelOutputRoot = join(root, '.vercel', 'output', 'static');
const outputRoot = existsSync(vercelOutputRoot) ? vercelOutputRoot : join(root, 'dist', 'client');
const vercelConfigPath = join(root, '.vercel', 'output', 'config.json');
const serverRoutePatterns = existsSync(vercelConfigPath)
  ? JSON.parse(readFileSync(vercelConfigPath, 'utf8')).routes
    .filter((route) => typeof route.src === 'string' && route.dest === '_render')
    .map((route) => new RegExp(route.src))
  : [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function targetExists(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return false;
  }

  const cleanPath = decodedPath.replace(/^\/+/, '');
  if (serverRoutePatterns.some((pattern) => pattern.test(`/${cleanPath}`))) return true;
  const absolutePath = resolve(outputRoot, cleanPath);
  if (!absolutePath.startsWith(resolve(outputRoot))) return false;

  if (extname(cleanPath)) return existsSync(absolutePath);
  return [
    absolutePath,
    `${absolutePath}.html`,
    join(absolutePath, 'index.html'),
  ].some((candidate) => existsSync(candidate));
}

const brokenLinks = [];
const htmlFiles = walk(outputRoot).filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const hrefPattern = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefPattern.exec(html))) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/')) continue;
    const pathname = href.split(/[?#]/, 1)[0] || '/';
    if (!targetExists(pathname)) {
      brokenLinks.push(`${relative(outputRoot, file)} -> ${href}`);
    }
  }
}

const uniqueBrokenLinks = [...new Set(brokenLinks)].sort();
if (uniqueBrokenLinks.length > 0) {
  console.error(`Found ${uniqueBrokenLinks.length} broken internal links:`);
  for (const link of uniqueBrokenLinks.slice(0, 100)) console.error(`- ${link}`);
  if (uniqueBrokenLinks.length > 100) console.error(`- …and ${uniqueBrokenLinks.length - 100} more`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} generated pages: no broken internal links.`);
}
