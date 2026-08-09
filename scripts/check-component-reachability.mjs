import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');
const sourceExtensions = ['.astro', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.css'];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(sourceRoot);
const knownFiles = new Set(files.map((file) => resolve(file)));
const importGraph = new Map();

function resolveLocalImport(importer, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(importer, '..', specifier);
  const candidates = [
    base,
    ...sourceExtensions.map((extension) => `${base}${extension}`),
    ...sourceExtensions.map((extension) => join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => knownFiles.has(candidate)) ?? null;
}

for (const file of files) {
  if (!['.astro', '.tsx', '.ts', '.jsx', '.js', '.mjs'].includes(extname(file))) continue;
  const source = readFileSync(file, 'utf8');
  const imports = [];
  const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = importPattern.exec(source))) {
    const dependency = resolveLocalImport(file, match[1] ?? match[2]);
    if (dependency) imports.push(dependency);
  }
  importGraph.set(resolve(file), imports);
}

const pageRoots = files
  .filter((file) => file.startsWith(join(sourceRoot, 'pages')))
  .filter((file) => ['.astro', '.tsx', '.ts', '.jsx', '.js', '.mjs'].includes(extname(file)))
  .map((file) => resolve(file));
const reachable = new Set();
const pending = [...pageRoots];

while (pending.length > 0) {
  const file = pending.pop();
  if (!file || reachable.has(file)) continue;
  reachable.add(file);
  pending.push(...(importGraph.get(file) ?? []));
}

const unreachableComponents = files
  .filter((file) => file.startsWith(join(sourceRoot, 'components')))
  .filter((file) => ['.astro', '.tsx', '.jsx'].includes(extname(file)))
  .filter((file) => !reachable.has(resolve(file)))
  .map((file) => relative(root, file))
  .sort();

if (unreachableComponents.length > 0) {
  console.error('Unreachable components found:');
  for (const component of unreachableComponents) console.error(`- ${component}`);
  process.exitCode = 1;
} else {
  console.log('All components are reachable from a public page entry.');
}
