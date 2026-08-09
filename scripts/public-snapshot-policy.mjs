import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PUBLIC_ROOT_FILES = new Set([
  ".env.example",
  ".gitignore",
  ".nvmrc",
  "astro.config.mjs",
  "CONTENT_ENTRY_TEMPLATES.md",
  "CONTENT_LICENSE.md",
  "CONTRIBUTING.md",
  "DEPLOYMENT.md",
  "GROWTH_STRATEGY.md",
  "LICENSE",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "PRODUCT_DIRECTION.md",
  "PUBLIC_SNAPSHOT.md",
  "README.md",
  "schema-supabase.sql",
  "schema.sql",
  "SECURITY.md",
  "tsconfig.json",
]);

const PUBLIC_DIRECTORIES = [".github", "public", "scripts", "src", "sql", "test"];

const DENIED_PATHS = new Set([
  "sql/import-data.sql",
  "MAINTENANCE.md",
  "CONTENT_AUDIT_20260722.md",
  "CONTENT_MAINTENANCE_PLAN.md",
  "design-qa.md",
]);

const DENIED_PREFIXES = [
  ".astro/",
  ".git/",
  ".vercel/",
  "book-cover-drop/",
  "dist/",
  "film-cover-drop/",
  "node_modules/",
  "output/",
];

const SENSITIVE_SQL =
  /INSERT\s+INTO\s+(?:users|comments|comment_likes|comment_reports|user_interactions|newsletter_subscribers)\b/i;
const PRIVATE_KEY = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const TOKEN_PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
];
const ENV_SECRET =
  /^(DATABASE_URL|NEON_DATABASE_URL|JWT_SECRET|R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY)\s*=\s*(.+)$/gim;

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isPlaceholder(value) {
  return /(?:^$|replace[-_ ]?me|your[-_\s]|example|placeholder|password|user:|project[-_ ]?ref|xxxx|\[.+\]|<.+>|\.\.\.)/i.test(
    value.trim(),
  );
}

export function isAllowedPublicPath(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized || normalized.startsWith("../")) return false;
  if (DENIED_PATHS.has(normalized)) return false;
  if (DENIED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
  if (/^\.env(?:\.|$)/.test(normalized) && normalized !== ".env.example") return false;
  if (/\.py$/i.test(normalized)) return false;
  if (/\.(?:csv|db|dump|sqlite|sqlite3)$/i.test(normalized)) return false;
  if (PUBLIC_ROOT_FILES.has(normalized)) return true;
  return PUBLIC_DIRECTORIES.some((directory) => normalized.startsWith(`${directory}/`));
}

async function walk(root, relative = "") {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = normalizePath(path.join(relative, entry.name));
    if (DENIED_PREFIXES.some((prefix) => `${child}/`.startsWith(prefix))) continue;
    if (entry.isDirectory()) files.push(...(await walk(root, child)));
    if (entry.isFile()) files.push(child);
  }

  return files;
}

export async function scanPublicSnapshot(root) {
  const violations = [];
  const files = await walk(root);

  for (const relative of files) {
    if (!isAllowedPublicPath(relative) && relative !== "PUBLIC_SNAPSHOT_VERSION.json") {
      violations.push(`file is outside the public allowlist: ${relative}`);
    }

    const absolute = path.join(root, relative);
    const buffer = await readFile(absolute);
    if (buffer.includes(0)) continue;
    const text = buffer.toString("utf8");

    if (/\.sql$/i.test(relative) && SENSITIVE_SQL.test(text)) {
      violations.push(`user-data SQL is not publishable: ${relative}`);
    }
    if (PRIVATE_KEY.test(text) || TOKEN_PATTERNS.some((pattern) => pattern.test(text))) {
      violations.push(`embedded credential detected: ${relative}`);
    }

    for (const match of text.matchAll(ENV_SECRET)) {
      if (!isPlaceholder(match[2])) {
        violations.push(`embedded credential detected: ${relative} (${match[1]})`);
      }
    }
  }

  return [...new Set(violations)].sort();
}

async function main() {
  const root = path.resolve(process.argv[2] ?? ".");
  const violations = await scanPublicSnapshot(root);
  if (violations.length > 0) {
    console.error("Public snapshot audit failed:");
    violations.forEach((item) => console.error(`- ${item}`));
    process.exitCode = 1;
    return;
  }
  console.log("Public snapshot audit passed.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
