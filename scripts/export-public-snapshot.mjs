import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isAllowedPublicPath,
  scanPublicSnapshot,
} from "./public-snapshot-policy.mjs";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputArgument = process.argv[2];

if (!outputArgument) {
  console.error("Usage: npm run export:public-snapshot -- /absolute/empty/output-directory");
  process.exit(1);
}

const outputRoot = path.resolve(outputArgument);
if (outputRoot === repositoryRoot || repositoryRoot.startsWith(`${outputRoot}${path.sep}`)) {
  throw new Error("Refusing to export into the repository or one of its parents.");
}

await mkdir(outputRoot, { recursive: true });
if ((await readdir(outputRoot)).length > 0) {
  throw new Error(`Public snapshot output must be empty: ${outputRoot}`);
}

const trackedAndNew = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: repositoryRoot, encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean)
  .filter(isAllowedPublicPath)
  .sort();

for (const relative of trackedAndNew) {
  const source = path.join(repositoryRoot, relative);
  const destination = path.join(outputRoot, relative);
  const sourceStat = await stat(source);
  if (!sourceStat.isFile()) continue;
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
const snapshotVersion = {
  generatedAt: new Date().toISOString(),
  sourceRevision,
  policy: "allowlist-v1",
};
await writeFile(
  path.join(outputRoot, "PUBLIC_SNAPSHOT_VERSION.json"),
  `${JSON.stringify(snapshotVersion, null, 2)}\n`,
);

const requiredFiles = [
  "LICENSE",
  "CONTENT_LICENSE.md",
  "PUBLIC_SNAPSHOT.md",
  "README.md",
  "package.json",
];
for (const required of requiredFiles) {
  await stat(path.join(outputRoot, required));
}

const violations = await scanPublicSnapshot(outputRoot);
if (violations.length > 0) {
  throw new Error(`Public snapshot audit failed:\n- ${violations.join("\n- ")}`);
}

console.log(`Exported ${trackedAndNew.length} files to ${outputRoot}`);
console.log(`Source revision: ${sourceRevision}`);
