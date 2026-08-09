import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import "../src/i18n/translations";
import { getCanonicalGenre, getGenreTranslation, hasGenreTranslation, translateAward } from "../src/i18n/genreUtils";
import { getLanguageName } from "../src/i18n/languageUtils";
import { getCanonicalRegion, getRegionTranslation, hasRegionTranslation } from "../src/i18n/regionUtils";
import topicsMapping from "../src/i18n/topicsMapping.json";
import { getTopicSlug } from "../src/i18n/topicsUtils";

const contentRoot = path.join(process.cwd(), "src/content");
const contentCollections = ["books", "articles", "films", "videos", "podcasts", "papers"];

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(target) : [target];
  }));
  return nested.flat().filter((file) => /\.mdx?$/.test(file));
}

function inlineArray(frontmatter: string, field: string): string[] {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(\\[[^\\n]*\\])`, "m"));
  return match ? JSON.parse(match[1]) : [];
}

test("canonical topics generate unique public slugs", () => {
  const topicsBySlug = new Map<string, string>();

  for (const topic of Object.keys(topicsMapping)) {
    const slug = getTopicSlug(topic);
    assert.equal(topicsBySlug.has(slug), false, `${topic} collides with ${topicsBySlug.get(slug)} at ${slug}`);
    topicsBySlug.set(slug, topic);
  }
});

test("region aliases share one canonical filter value", () => {
  assert.equal(getCanonicalRegion("Brazil"), "Brazil");
  assert.equal(getCanonicalRegion("美国"), "USA");
  assert.equal(getCanonicalRegion("美國"), "USA");
  assert.equal(getCanonicalRegion("États-Unis"), "USA");
  assert.equal(getCanonicalRegion("Deutschland / USA"), "Deutschland / USA");
  assert.equal(getRegionTranslation("Brazil", "zh-CN"), "巴西");
  assert.equal(getRegionTranslation("Mexico", "ja"), "メキシコ");
  assert.equal(getRegionTranslation("Japan", "zh-TW"), "日本");
  assert.equal(getRegionTranslation("Japan", "fr"), "Japon");
  assert.equal(getRegionTranslation("United States, Philippines", "fr"), "États-Unis, Philippines");
});

test("every visible content tag has a complete locale dictionary entry", async () => {
  const topicKeys = new Set(Object.keys(topicsMapping));
  const allFiles = (await Promise.all(contentCollections.map((collection) =>
    markdownFiles(path.join(contentRoot, collection))
  ))).flat();

  for (const file of allFiles) {
    const contents = await readFile(file, "utf8");
    const frontmatter = contents.split("---", 3)[1] ?? "";

    for (const topic of inlineArray(frontmatter, "topics")) {
      assert.ok(topicKeys.has(topic), `${path.relative(process.cwd(), file)} has unmapped topic: ${topic}`);
    }

    if (!file.includes(`${path.sep}films${path.sep}`)) continue;

    const country = frontmatter.match(/^country:\s*["']?([^\n"']+)["']?\s*$/m)?.[1]?.trim();
    if (country) {
      assert.ok(hasRegionTranslation(country), `${path.relative(process.cwd(), file)} has unmapped region: ${country}`);
    }

    for (const genre of inlineArray(frontmatter, "genre")) {
      assert.ok(hasGenreTranslation(genre), `${path.relative(process.cwd(), file)} has unmapped genre: ${genre}`);
    }
  }
});

test("regional Chinese language codes keep their script distinction", () => {
  assert.equal(getLanguageName("zh-CN", "zh-CN"), "简体中文");
  assert.equal(getLanguageName("zh-TW", "zh-CN"), "繁体中文");
  assert.equal(getLanguageName("zh-CN", "zh-TW"), "簡體中文");
  assert.equal(getLanguageName("zh-TW", "ja"), "中国語（繁体字）");
});

test("genre aliases and award components render in the page locale", () => {
  assert.equal(getCanonicalGenre("Coming-of-age"), "Coming-of-Age");
  assert.equal(getCanonicalGenre("剧情"), "Drama");
  assert.equal(getGenreTranslation("Drama", "zh-TW"), "劇情");
  assert.equal(getGenreTranslation("剧情", "fr"), "Drame");
  assert.equal(getGenreTranslation("Romance", "zh-TW"), "愛情");
  assert.equal(getGenreTranslation("文化的なアイデンティティ", "en"), "Cultural Identity");
  assert.equal(getGenreTranslation("Surrealism", "ja"), "シュルレアリスム");
  assert.equal(translateAward("Cannes Film Festival Best Director Winner", "fr"), "Festival de Cannes Meilleure réalisation Lauréat");
  assert.equal(translateAward("Academy Award Best Picture Nomination", "ja"), "アカデミー賞 作品賞 ノミネート");
});
