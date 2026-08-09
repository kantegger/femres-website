import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetRoot = join(process.cwd(), 'dist', 'client', '_astro');
const budgets = {
  maxJavaScriptChunkGzip: 45 * 1024,
  totalJavaScriptGzip: 75 * 1024,
  maxCssAsset: 100 * 1024,
  totalCss: 380 * 1024,
};

const assetNames = readdirSync(assetRoot);
const javascript = assetNames.filter((name) => name.endsWith('.js'));
const stylesheets = assetNames.filter((name) => name.endsWith('.css'));
const violations = [];

const javascriptSizes = javascript.map((name) => ({
  name,
  size: gzipSync(readFileSync(join(assetRoot, name))).byteLength,
}));
const cssSizes = stylesheets.map((name) => ({
  name,
  size: readFileSync(join(assetRoot, name)).byteLength,
}));

for (const asset of javascriptSizes) {
  if (asset.size > budgets.maxJavaScriptChunkGzip) {
    violations.push(`${asset.name} is ${asset.size} B gzip (limit ${budgets.maxJavaScriptChunkGzip} B)`);
  }
}
for (const asset of cssSizes) {
  if (asset.size > budgets.maxCssAsset) {
    violations.push(`${asset.name} is ${asset.size} B (limit ${budgets.maxCssAsset} B)`);
  }
}

const totalJavaScriptGzip = javascriptSizes.reduce((total, asset) => total + asset.size, 0);
const totalCss = cssSizes.reduce((total, asset) => total + asset.size, 0);
if (totalJavaScriptGzip > budgets.totalJavaScriptGzip) {
  violations.push(`Total JavaScript is ${totalJavaScriptGzip} B gzip (limit ${budgets.totalJavaScriptGzip} B)`);
}
if (totalCss > budgets.totalCss) {
  violations.push(`Total CSS is ${totalCss} B (limit ${budgets.totalCss} B)`);
}
if (assetNames.some((name) => basename(name).startsWith('MusicPlayer.'))) {
  violations.push('The retired MusicPlayer client chunk is still present.');
}

if (violations.length > 0) {
  console.error('Performance budget failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`Performance budget passed: ${totalJavaScriptGzip} B JS gzip, ${totalCss} B CSS.`);
}
