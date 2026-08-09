import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CollectionName =
  | "books"
  | "articles"
  | "films"
  | "videos"
  | "podcasts"
  | "papers";

type FrontmatterValue = string | string[];

type ContentEntry = {
  collection: CollectionName;
  filePath: string;
  slug: string;
  baseSlug: string;
  locale: LocaleSuffix;
  data: Map<string, FrontmatterValue>;
  sourceUrls: string[];
};

type AuditIssue = string | [string, string[]];

type LocaleSuffix = "zh-CN" | "en" | "zh-TW" | "ja" | "fr";

const COLLECTIONS: CollectionName[] = [
  "books",
  "articles",
  "films",
  "videos",
  "podcasts",
  "papers",
];

const REQUIRED_FIELDS: Record<CollectionName, string[]> = {
  books: ["title", "author", "description", "publishDate", "topics", "status"],
  articles: [
    "title",
    "author",
    "description",
    "publishDate",
    "topics",
    "sourceUrl",
    "status",
  ],
  films: [
    "title",
    "director",
    "description",
    "releaseDate",
    "year",
    "country",
    "topics",
    "status",
  ],
  videos: [
    "title",
    "author",
    "description",
    "publishDate",
    "topics",
    "sourceUrl",
    "status",
  ],
  podcasts: [
    "title",
    "author",
    "description",
    "publishDate",
    "topics",
    "sourceUrl",
    "status",
  ],
  papers: [
    "title",
    "author",
    "description",
    "publishDate",
    "topics",
    "sourceUrl",
    "status",
  ],
};

const SOURCE_REQUIRED: CollectionName[] = [
  "articles",
  "videos",
  "podcasts",
  "papers",
];

const LOCALES: LocaleSuffix[] = ["zh-CN", "en", "zh-TW", "ja", "fr"];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(repoRoot, "src", "content");
const topicsMappingPath = path.join(
  repoRoot,
  "src",
  "i18n",
  "topicsMapping.json",
);

function walkMarkdownFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  return readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return walkMarkdownFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function getFrontmatter(text: string): string {
  const normalized = text.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? "";
}

function parseInlineArray(value: string): string[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }

  return [...trimmed.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function parseFrontmatter(frontmatter: string): Map<string, FrontmatterValue> {
  const data = new Map<string, FrontmatterValue>();
  const lines = frontmatter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!field) {
      continue;
    }

    const [, key, rawValue] = field;
    if (key === "sourceUrl") {
      const nestedUrls = [...rawValue.matchAll(/"url"\s*:\s*"([^"]+)"/g)].map(
        (match) => match[1],
      );
      if (nestedUrls.length > 0) {
        data.set(key, nestedUrls);
        continue;
      }

      if (rawValue.trim() === "[") {
        continue;
      }

      if (rawValue.trim()) {
        data.set(key, unquote(rawValue));
        continue;
      }

      continue;
    }

    const inlineArray = parseInlineArray(rawValue);
    if (inlineArray) {
      data.set(key, inlineArray);
      continue;
    }

    if (rawValue.trim() === "[") {
      const values: string[] = [];
      for (let blockIndex = index + 1; blockIndex < lines.length; blockIndex += 1) {
        const blockLine = lines[blockIndex].trim();
        if (blockLine === "]") {
          break;
        }

        const value = blockLine.match(/^"([^"]+)",?$/);
        if (value) {
          values.push(value[1]);
        }
      }

      data.set(key, values);
      continue;
    }

    if (rawValue.trim()) {
      data.set(key, unquote(rawValue));
      continue;
    }

    if (key === "sourceUrl") {
      continue;
    }

    const blockValues: string[] = [];
    for (let blockIndex = index + 1; blockIndex < lines.length; blockIndex += 1) {
      const blockLine = lines[blockIndex];
      if (/^[A-Za-z][A-Za-z0-9_-]*:\s*/.test(blockLine)) {
        break;
      }

      const item = blockLine.match(/^\s*-\s+(.+)$/);
      if (item) {
        blockValues.push(unquote(item[1]));
      }
    }

    if (blockValues.length > 0) {
      data.set(key, blockValues);
    }
  }

  return data;
}

function extractSourceUrls(frontmatter: string, data: Map<string, FrontmatterValue>): string[] {
  const sourceValue = data.get("sourceUrl");
  const urls = new Set<string>();

  if (typeof sourceValue === "string") {
    urls.add(sourceValue);
  } else if (Array.isArray(sourceValue)) {
    sourceValue.forEach((url) => urls.add(url));
  }

  const lines = frontmatter.split(/\r?\n/);
  const sourceStart = lines.findIndex((line) => /^sourceUrl:\s*$/.test(line));
  if (sourceStart >= 0) {
    for (let index = sourceStart + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^[A-Za-z][A-Za-z0-9_-]*:\s*/.test(line)) {
        break;
      }

      const nestedUrl = line.match(/^\s*(?:-\s*)?url:\s*(.+)$/);
      if (nestedUrl) {
        urls.add(unquote(nestedUrl[1]));
      }
    }
  }

  return [...urls].filter(Boolean);
}

function getLocaleAndBaseSlug(slug: string): { locale: LocaleSuffix; baseSlug: string } {
  const localeMatch = slug.match(/-(en|fr|ja|tw|zh-TW|cht)$/);
  if (!localeMatch) {
    return { locale: "zh-CN", baseSlug: slug };
  }

  const suffix = localeMatch[1];
  const locale =
    suffix === "tw" || suffix === "zh-TW" || suffix === "cht"
      ? "zh-TW"
      : (suffix as LocaleSuffix);

  return {
    locale,
    baseSlug: slug.slice(0, -localeMatch[0].length),
  };
}

function hasLocaleCompanions(filePath: string, slug: string): boolean {
  const localeMatch = slug.match(/-(en|fr|ja|tw|zh-TW|cht)$/);
  if (!localeMatch) {
    return false;
  }

  const baseSlug = slug.slice(0, -localeMatch[0].length);
  const dirPath = path.dirname(filePath);

  return [
    `${baseSlug}.md`,
    `${baseSlug}-en.md`,
    `${baseSlug}-fr.md`,
    `${baseSlug}-ja.md`,
    `${baseSlug}-tw.md`,
    `${baseSlug}-zh-TW.md`,
    `${baseSlug}-cht.md`,
  ].some((fileName) => fileName !== path.basename(filePath) && existsSync(path.join(dirPath, fileName)));
}

function parseContentEntry(filePath: string, collection: CollectionName): ContentEntry {
  const text = readFileSync(filePath, "utf8");
  const frontmatter = getFrontmatter(text);
  const data = parseFrontmatter(frontmatter);
  const slug = path.basename(filePath, ".md");
  const { locale, baseSlug } = hasLocaleCompanions(filePath, slug)
    ? getLocaleAndBaseSlug(slug)
    : { locale: "zh-CN" as const, baseSlug: slug };

  return {
    collection,
    filePath,
    slug,
    baseSlug,
    locale,
    data,
    sourceUrls: extractSourceUrls(frontmatter, data),
  };
}

function getTopics(entry: ContentEntry): string[] {
  const topics = entry.data.get("topics");
  return Array.isArray(topics) ? topics : [];
}

function getDateValue(entry: ContentEntry): string | null {
  const publishDate = entry.data.get("publishDate");
  const releaseDate = entry.data.get("releaseDate");
  const value = publishDate ?? releaseDate;

  return typeof value === "string" ? value : null;
}

function isValidIsbn(value: string): boolean {
  const normalized = value.toUpperCase().replace(/[\s-]/g, "");

  if (/^\d{13}$/.test(normalized)) {
    const sum = [...normalized].reduce((total, digit, index) => {
      const weight = index % 2 === 0 ? 1 : 3;
      return total + Number(digit) * weight;
    }, 0);
    return sum % 10 === 0;
  }

  if (/^\d{9}[\dX]$/.test(normalized)) {
    const sum = [...normalized].reduce((total, digit, index) => {
      const valueAtIndex = digit === "X" ? 10 : Number(digit);
      return total + valueAtIndex * (10 - index);
    }, 0);
    return sum % 11 === 0;
  }

  return false;
}

function relative(filePath: string): string {
  return path.relative(repoRoot, filePath);
}

function countBy<T>(items: T[], getKey: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
}

function formatCounts(counts: Map<string, number>): string[] {
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => `- ${key}: ${count}`);
}

const entries = COLLECTIONS.flatMap((collection) =>
  walkMarkdownFiles(path.join(contentRoot, collection)).map((filePath) =>
    parseContentEntry(filePath, collection),
  ),
);

const topicMapping = JSON.parse(readFileSync(topicsMappingPath, "utf8")) as Record<
  string,
  Record<string, string>
>;

const missingFields: string[] = [];
const missingSourceUrls: string[] = [];
const futureDates: string[] = [];
const invalidIsbns: string[] = [];
const duplicateSourceUrls = new Map<string, string[]>();
const duplicateTopics: string[] = [];
const topicCounts = new Map<string, number>();
const usedTopics = new Set<string>();

const today = new Date();
today.setHours(23, 59, 59, 999);

entries.forEach((entry) => {
  REQUIRED_FIELDS[entry.collection].forEach((field) => {
    if (!entry.data.has(field)) {
      missingFields.push(`${relative(entry.filePath)} missing ${field}`);
    }
  });

  if (SOURCE_REQUIRED.includes(entry.collection) && entry.sourceUrls.length === 0) {
    missingSourceUrls.push(relative(entry.filePath));
  }

  const dateValue = getDateValue(entry);
  if (dateValue && new Date(dateValue) > today) {
    futureDates.push(`${relative(entry.filePath)} has future date ${dateValue}`);
  }

  if (entry.collection === "books") {
    const isbn = entry.data.get("isbn");
    if (typeof isbn === "string" && !isValidIsbn(isbn)) {
      invalidIsbns.push(`${relative(entry.filePath)} has invalid ISBN ${isbn}`);
    }
  }

  const topics = getTopics(entry);
  const seenTopics = new Set<string>();
  topics.forEach((topic) => {
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    usedTopics.add(topic);
    if (seenTopics.has(topic)) {
      duplicateTopics.push(`${relative(entry.filePath)} repeats topic ${topic}`);
    }
    seenTopics.add(topic);
  });

  entry.sourceUrls.forEach((url) => {
    const paths = duplicateSourceUrls.get(url) ?? [];
    paths.push(relative(entry.filePath));
    duplicateSourceUrls.set(url, paths);
  });
});

const repeatedSourceUrls = [...duplicateSourceUrls.entries()].filter(
  ([, paths]) => new Set(paths.map((filePath) => {
    const entry = entries.find((candidate) => relative(candidate.filePath) === filePath);
    return entry ? `${entry.collection}/${entry.baseSlug}` : filePath;
  })).size > 1,
);

const missingTopicMappings = [...usedTopics]
  .filter((topic) => !topicMapping[topic])
  .sort();

const incompleteTopicMappings = [...usedTopics]
  .filter(
    (topic) =>
      topicMapping[topic] && LOCALES.some((locale) => !topicMapping[topic][locale]),
  )
  .sort();

const unusedTopicMappings = Object.keys(topicMapping)
  .filter((topic) => !usedTopics.has(topic))
  .sort();

const topicDrift: string[] = [];
COLLECTIONS.forEach((collection) => {
  const groups = new Map<string, ContentEntry[]>();
  entries
    .filter((entry) => entry.collection === collection)
    .forEach((entry) => {
      const key = `${entry.collection}/${entry.baseSlug}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });

  groups.forEach((groupEntries, groupKey) => {
    if (groupEntries.length < 2) {
      return;
    }

    const variants = new Set(
      groupEntries.map((entry) => JSON.stringify(getTopics(entry))),
    );

    if (variants.size > 1) {
      const files = groupEntries
        .map((entry) => `${entry.locale}:${relative(entry.filePath)}`)
        .join(", ");
      topicDrift.push(`${groupKey} has ${variants.size} topic variants (${files})`);
    }
  });
});

const collectionCounts = countBy(entries, (entry) => entry.collection);
const localeCounts = countBy(entries, (entry) => entry.locale);
const localeCountValues = [...localeCounts.values()];
const localeImbalance =
  localeCountValues.length > 0 &&
  Math.max(...localeCountValues) !== Math.min(...localeCountValues);

const sortedTopTopics = [...topicCounts.entries()]
  .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
  .slice(0, 20);

const checks: Array<[string, AuditIssue[]]> = [
  ["Missing required fields", missingFields],
  ["Missing required sourceUrl", missingSourceUrls],
  ["Future dates", futureDates],
  ["Invalid ISBN values", invalidIsbns],
  ["Duplicate source URLs", repeatedSourceUrls],
  ["Duplicate topics per item", duplicateTopics],
  ["Missing topic mappings", missingTopicMappings],
  ["Incomplete topic mappings", incompleteTopicMappings],
  ["Unused topic mappings", unusedTopicMappings],
  ["Locale topic drift", topicDrift],
];

console.log("# FemRes Content Audit");
console.log(`Repo: ${repoRoot}`);
console.log("");
console.log("## Counts by Collection");
console.log(formatCounts(collectionCounts).join("\n"));
console.log("");
console.log("## Counts by Locale");
console.log(formatCounts(localeCounts).join("\n"));
console.log("");
console.log("## Top Topics");
sortedTopTopics.forEach(([topic, count]) => {
  console.log(`- ${topic}: ${count}`);
});
console.log("");
console.log("## Checks");
checks.forEach(([label, issues]) => {
  console.log(`- ${label}: ${issues.length}`);
});
console.log(`- Locale balance: ${localeImbalance ? "imbalanced" : "balanced"}`);

checks.forEach(([label, issues]) => {
  if (issues.length === 0) {
    return;
  }

  console.log("");
  console.log(`### ${label}`);
  issues.slice(0, 50).forEach((issue) => {
    if (Array.isArray(issue)) {
      console.log(`- ${issue[0]} -> ${issue[1].join(", ")}`);
      return;
    }

    console.log(`- ${issue}`);
  });
  if (issues.length > 50) {
    console.log(`- ... ${issues.length - 50} more`);
  }
});

const issueCount =
  checks.reduce((total, [, issues]) => total + issues.length, 0) +
  (localeImbalance ? 1 : 0);

if (issueCount > 0) {
  console.error("");
  console.error(`Content audit failed with ${issueCount} issue(s).`);
  process.exit(1);
}

console.log("");
console.log("Content audit passed.");
