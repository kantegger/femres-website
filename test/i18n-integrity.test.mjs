import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const locales = ["zh-CN", "zh-TW", "en", "ja", "fr"];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function flatten(value, prefix = "", result = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, result));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key, result));
  } else {
    result.set(prefix, value);
  }
  return result;
}

test("locale catalogs have identical keys and interpolation parameters", async () => {
  const catalogs = Object.fromEntries(await Promise.all(locales.map(async (locale) => [
    locale,
    JSON.parse(await source(`src/i18n/locales/${locale}.json`)),
  ])));
  const baseline = flatten(catalogs.en);

  for (const locale of locales) {
    const current = flatten(catalogs[locale]);
    assert.deepEqual([...current.keys()], [...baseline.keys()], `${locale} keys`);
    for (const [key, baselineValue] of baseline) {
      const value = current.get(key);
      if (typeof baselineValue !== "string" || typeof value !== "string") continue;
      const placeholders = (text) => [...text.matchAll(/\{([\w]+)\}/g)].map((match) => match[1]).sort();
      assert.deepEqual(placeholders(value), placeholders(baselineValue), `${locale}:${key}`);
    }
  }
});

test("every topic has a complete five-locale label", async () => {
  const topics = JSON.parse(await source("src/i18n/topicsMapping.json"));
  for (const [topic, labels] of Object.entries(topics)) {
    for (const locale of locales) {
      assert.equal(typeof labels[locale], "string", `${topic}:${locale}`);
      assert.ok(labels[locale].trim(), `${topic}:${locale}`);
    }
  }
});

test("localized content uses the supported locale suffix convention", async () => {
  const files = await walk(path.join(root, "src/content"));
  const invalid = files
    .filter((file) => /-zh-(?:CN|TW)\.mdx?$/i.test(file))
    .map((file) => path.relative(root, file));

  assert.deepEqual(invalid, []);
});

test("search renders translated topic labels while preserving canonical values", async () => {
  const search = await source("src/components/EditorialSearch.astro");
  assert.match(search, /getTopicTranslation\(topic, locale\)/);
  assert.doesNotMatch(search, />\{topic\}<\/option>/);
  assert.doesNotMatch(search, /<li>\{topic\}<\/li>/);
});

test("film regions are displayed through one locale-aware formatter", async () => {
  const listing = await source("src/components/EditorialFilmIndex.astro");
  const detail = await source("src/components/EditorialFilmDetail.astro");
  const filmListing = await source("src/lib/filmListing.ts");

  assert.doesNotMatch(listing, /heading="Region"/);
  assert.doesNotMatch(listing, /\{(?:lead|film)\.data\.country\}/);
  assert.doesNotMatch(detail, /<dd>\{film\.data\.country\}<\/dd>/);
  assert.match(filmListing, /getRegionTranslation/);
});

test("detail pages preserve regional language codes", async () => {
  const detailFiles = [
    "EditorialBookDetail.astro",
    "EditorialFilmDetail.astro",
    "EditorialVideoDetail.astro",
    "EditorialPodcastDetail.astro",
    "EditorialPaperDetail.astro",
  ];

  for (const file of detailFiles) {
    const contents = await source(`src/components/${file}`);
    assert.doesNotMatch(contents, /split\(["']-["']\)\[0\]/, file);
  }
});

test("film genre and award dictionaries cover every site locale", async () => {
  const genres = await source("src/i18n/genreUtils.ts");
  assert.doesNotMatch(genres, /Partial<Record<Locale, string>>/);
  assert.match(genres, /["']zh-TW["']:/);
  assert.match(genres, /ja:/);
  assert.match(genres, /fr:/);
});

test("editorial chrome does not bypass locale-aware labels", async () => {
  const files = await Promise.all([
    "EditorialHeader.astro",
    "Footer.astro",
    "EditorialContact.astro",
    "NewsletterPreferences.astro",
    "EditorialNotFound.astro",
    "InteractionButtons.tsx",
    "ProfileContentListPage.astro",
  ].map(async (file) => [file, await source(`src/components/${file}`)]));

  const combined = files.map(([, contents]) => contents).join("\n");
  assert.doesNotMatch(combined, /aria-label="(?:Breadcrumb|FemRes home|Primary navigation|Mobile navigation)"/);
  assert.doesNotMatch(combined, /<dt>(?:Response|Scope)<\/dt>/);
  assert.doesNotMatch(combined, /aria-label="Loading likes"/);
  assert.doesNotMatch(combined, />Newsletter \/ Privacy</);
  assert.doesNotMatch(combined, />Open source · MIT License</);
  assert.doesNotMatch(combined, />The Living Review</);
});
