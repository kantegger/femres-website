import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  isAllowedPublicPath,
  scanPublicSnapshot,
} from "../scripts/public-snapshot-policy.mjs";

test("public snapshot policy is allowlist-based", () => {
  assert.equal(isAllowedPublicPath("src/pages/index.astro"), true);
  assert.equal(isAllowedPublicPath("src/content/books/example.md"), true);
  assert.equal(isAllowedPublicPath("test/seo.test.mjs"), true);
  assert.equal(isAllowedPublicPath("LICENSE"), true);
  assert.equal(isAllowedPublicPath(".env.example"), true);

  assert.equal(isAllowedPublicPath("sql/import-data.sql"), false);
  assert.equal(isAllowedPublicPath("MAINTENANCE.md"), false);
  assert.equal(isAllowedPublicPath("CONTENT_AUDIT_20260722.md"), false);
  assert.equal(isAllowedPublicPath("book-cover-drop/README.md"), false);
  assert.equal(isAllowedPublicPath("scripts/find_missing_translations.py"), false);
  assert.equal(isAllowedPublicPath(".env.local"), false);
});

test("snapshot scanner rejects user data and embedded credentials", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "femres-public-policy-"));
  await mkdir(path.join(root, "sql"), { recursive: true });
  await writeFile(
    path.join(root, "sql", "unsafe.sql"),
    "INSERT INTO users (email) VALUES ('reader@example.org');\n",
  );
  await writeFile(
    path.join(root, ".env.example"),
    "JWT_SECRET=replace-me\nR2_SECRET_ACCESS_KEY=replace-me\n",
  );

  const violations = await scanPublicSnapshot(root);
  assert.ok(violations.some((item) => item.includes("user-data SQL")));
  assert.equal(
    violations.some((item) => item.includes("embedded credential")),
    false,
  );

  await writeFile(
    path.join(root, "unsafe-config.ts"),
    `const token = "${"ghp_" + "abcdefghijklmnopqrstuvwxyz1234567890"}";\n`,
  );
  const credentialViolations = await scanPublicSnapshot(root);
  assert.ok(
    credentialViolations.some((item) => item.includes("embedded credential")),
  );
});
