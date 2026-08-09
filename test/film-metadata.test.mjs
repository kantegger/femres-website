import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const filmDirectory = path.join(root, "src/content/films");
const locales = ["zh-CN", "zh-TW", "en", "ja", "fr"];
const suffixes = [
  ["-tw.md", "zh-TW"],
  ["-en.md", "en"],
  ["-ja.md", "ja"],
  ["-fr.md", "fr"],
  [".md", "zh-CN"],
];

const sourceSignature = (sources = []) => sources.map(({ platform, url }) => ({ platform, url }));

function scalar(frontmatter, field) {
  return frontmatter.match(new RegExp(`^${field}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"))?.[1]?.trim();
}

function sourceList(frontmatter, field) {
  const block = frontmatter.match(new RegExp(`^${field}: \\[\\n([\\s\\S]*?)^\\]$`, "m"))?.[1] ?? "";
  return [...block.matchAll(/\{ platform: "([^"]+)", url: "([^"]+)" \}/g)]
    .map(([, platform, url]) => ({ platform, url }));
}

test("film ratings and source links stay canonical across all locales", async () => {
  const files = (await readdir(filmDirectory)).filter((file) => file.endsWith(".md"));
  const groups = new Map();

  for (const file of files) {
    const [suffix, locale] = suffixes.find(([candidate]) => file.endsWith(candidate)) ?? [];
    assert.ok(suffix && locale, `${file} does not use a supported locale suffix`);
    const slug = file.slice(0, -suffix.length);
    const contents = await readFile(path.join(filmDirectory, file), "utf8");
    const frontmatter = contents.split("---", 3)[1] ?? "";
    const sources = sourceList(frontmatter, "sourceUrl");
    const verificationSources = sourceList(frontmatter, "verificationSources");
    const imdb = sources.filter(({ platform }) => platform === "IMDb");
    const douban = sources.filter(({ platform }) => platform === "Douban");
    const references = sources.filter(({ platform }) => platform !== "IMDb" && platform !== "Douban");

    assert.equal(imdb.length, 1, `${file} must contain one canonical IMDb source`);
    assert.equal(douban.length, 1, `${file} must contain one canonical Douban source`);
    assert.match(imdb[0].url, /^https:\/\/www\.imdb\.com\/title\/tt\d+\/$/, `${file} IMDb URL`);
    assert.match(douban[0].url, /^https:\/\/movie\.douban\.com\/subject\/\d+\/$/, `${file} Douban URL`);
    assert.ok(references.length <= 2, `${file} exposes more than two editorial reference sources`);
    const imdbRating = scalar(frontmatter, "imdbRating");
    const doubanRating = scalar(frontmatter, "doubanRating");
    assert.match(String(imdbRating), /^(?:10(?:\.0)?|\d(?:\.\d)?)$/, `${file} IMDb rating`);
    if (doubanRating != null) {
      assert.match(String(doubanRating), /^(?:10(?:\.0)?|\d(?:\.\d)?)$/, `${file} Douban rating`);
    }
    const ratingsUpdatedAt = new Date(scalar(frontmatter, "ratingsUpdatedAt"));
    assert.equal(Number.isNaN(ratingsUpdatedAt.valueOf()), false, `${file} must record ratingsUpdatedAt`);

    const seenUrls = new Set();
    for (const source of [...sources, ...verificationSources]) {
      assert.equal(seenUrls.has(source.url), false, `${file} duplicates ${source.url}`);
      seenUrls.add(source.url);
    }

    const localized = groups.get(slug) ?? new Map();
    localized.set(locale, {
      imdbRating,
      doubanRating: doubanRating ?? null,
      ratingsUpdatedAt: ratingsUpdatedAt.toISOString(),
      sourceUrl: sourceSignature(sources),
      verificationSources: sourceSignature(verificationSources),
    });
    groups.set(slug, localized);
  }

  for (const [slug, localized] of groups) {
    assert.deepEqual([...localized.keys()].sort(), [...locales].sort(), `${slug} locale coverage`);
    const baseline = localized.get("en");
    for (const locale of locales) {
      assert.deepEqual(localized.get(locale), baseline, `${slug}:${locale} rating/source metadata`);
    }
  }
});
