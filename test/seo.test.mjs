import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildAlternateUrls,
  buildCanonicalUrl,
  isNoIndexPath,
  normalizeMetaDescription,
  shouldIncludeInSitemap,
} from "../src/lib/seo.mjs";

test("canonical URLs use the production host and collapse the default locale prefix", () => {
  assert.equal(
    buildCanonicalUrl("/zh-CN/books/gender-trouble?ref=home"),
    "https://www.femres.org/books/gender-trouble/",
  );
  assert.equal(
    buildCanonicalUrl("/en/books/gender-trouble"),
    "https://www.femres.org/en/books/gender-trouble/",
  );
});

test("alternate URLs form one reciprocal five-language cluster", () => {
  assert.deepEqual(buildAlternateUrls("/ja/films/happy-hour-2015"), {
    "zh-CN": "https://www.femres.org/films/happy-hour-2015/",
    en: "https://www.femres.org/en/films/happy-hour-2015/",
    ja: "https://www.femres.org/ja/films/happy-hour-2015/",
    fr: "https://www.femres.org/fr/films/happy-hour-2015/",
    "zh-TW": "https://www.femres.org/zh-TW/films/happy-hour-2015/",
  });
});

test("utility and private routes are not indexable", () => {
  for (const path of [
    "/search",
    "/en/search?q=care",
    "/profile/bookmarks",
    "/ja/profile/likes",
    "/unsubscribe",
    "/fr/404",
  ]) {
    assert.equal(isNoIndexPath(path), true, path);
  }

  assert.equal(isNoIndexPath("/en/books/gender-trouble"), false);
});

test("sitemap excludes duplicate default-locale and noindex routes", () => {
  assert.equal(
    shouldIncludeInSitemap("https://www.femres.org/zh-CN/books/gender-trouble/"),
    false,
  );
  assert.equal(
    shouldIncludeInSitemap("https://www.femres.org/en/profile/bookmarks/"),
    false,
  );
  assert.equal(
    shouldIncludeInSitemap("https://www.femres.org/en/books/gender-trouble/"),
    true,
  );
});

test("meta descriptions are whitespace-normalized and bounded", () => {
  const source = `  ${"feminist research ".repeat(20)}  `;
  const description = normalizeMetaDescription(source);

  assert.equal(/\s{2,}/.test(description), false);
  assert.ok(description.length <= 180);
  assert.ok(description.endsWith("…"));
});

test("the shared layout exposes Bing ownership verification", () => {
  const layout = readFileSync(
    new URL("../src/layouts/Layout.astro", import.meta.url),
    "utf8",
  );

  assert.match(
    layout,
    /<meta\s+name="msvalidate\.01"\s+content="4329F6DB7DECDF1C2A396432B22857FB"\s*\/>/,
  );
});
