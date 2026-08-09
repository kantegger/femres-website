import { getCollection, render, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n";

export type ContentType =
  | "book"
  | "article"
  | "video"
  | "podcast"
  | "paper"
  | "film";

export type CollectionName =
  | "books"
  | "articles"
  | "videos"
  | "podcasts"
  | "papers"
  | "films";

export type AnyContentEntry =
  | (CollectionEntry<"books"> & { contentType: "book" })
  | (CollectionEntry<"articles"> & { contentType: "article" })
  | (CollectionEntry<"videos"> & { contentType: "video" })
  | (CollectionEntry<"podcasts"> & { contentType: "podcast" })
  | (CollectionEntry<"papers"> & { contentType: "paper" })
  | (CollectionEntry<"films"> & { contentType: "film" });

type ContentEntryByCollection = {
  books: CollectionEntry<"books"> & { contentType: "book" };
  articles: CollectionEntry<"articles"> & { contentType: "article" };
  videos: CollectionEntry<"videos"> & { contentType: "video" };
  podcasts: CollectionEntry<"podcasts"> & { contentType: "podcast" };
  papers: CollectionEntry<"papers"> & { contentType: "paper" };
  films: CollectionEntry<"films"> & { contentType: "film" };
};

type ContentEntryForCollection<T extends CollectionName> =
  ContentEntryByCollection[T];

export interface NormalizedContent {
  id: string;
  slug: string;
  cleanSlug: string;
  contentType: ContentType;
  title: string;
  author: string;
  description: string;
  date: Date;
  topics: string[];
  image?: string;
  sourceUrl?: string;
  originalTitle?: string;
  isbn?: string;
  readingTime?: number;
  duration?: number | string;
  episodeNumber?: number;
  year?: number;
  country?: string;
  genre?: string[];
  journal?: string;
  doi?: string;
  citationCount?: number;
  paperType?: "research" | "review" | "case-study" | "theoretical";
  original: AnyContentEntry;
}

export const collectionNames = [
  "books",
  "articles",
  "videos",
  "podcasts",
  "papers",
  "films",
] as const satisfies readonly CollectionName[];

export const collectionToContentType: Record<CollectionName, ContentType> = {
  books: "book",
  articles: "article",
  videos: "video",
  podcasts: "podcast",
  papers: "paper",
  films: "film",
};

export const contentTypeToCollection: Record<ContentType, CollectionName> = {
  book: "books",
  article: "articles",
  video: "videos",
  podcast: "podcasts",
  paper: "papers",
  film: "films",
};

export function isContentType(value: string): value is ContentType {
  return value in contentTypeToCollection;
}

export function resolveCollectionName(value: string): CollectionName | null {
  if (isContentType(value)) return contentTypeToCollection[value];

  return collectionNames.includes(value as CollectionName)
    ? (value as CollectionName)
    : null;
}

const localeSuffixes = ["-en", "-tw", "-ja", "-fr", "-cht"];

export function cleanLocalizedSlug(slug: string): string {
  const suffix = localeSuffixes.find((item) => slug.endsWith(item));
  return suffix ? slug.slice(0, -suffix.length) : slug;
}

export function isContentForLocale(slug: string, locale: Locale): boolean {
  if (locale === "en") return slug.endsWith("-en");
  if (locale === "ja") return slug.endsWith("-ja");
  if (locale === "fr") return slug.endsWith("-fr");
  if (locale === "zh-TW") return slug.endsWith("-tw") || slug.endsWith("-cht");
  return !localeSuffixes.some((suffix) => slug.endsWith(suffix));
}

export function getContentDate(entry: AnyContentEntry): Date {
  return entry.contentType === "film"
    ? entry.data.releaseDate
    : entry.data.publishDate;
}

export function normalizeContent(entry: AnyContentEntry): NormalizedContent {
  const base = {
    id: entry.id,
    slug: entry.id,
    cleanSlug: cleanLocalizedSlug(entry.id),
    contentType: entry.contentType,
    date: getContentDate(entry),
    original: entry,
  };

  switch (entry.contentType) {
    case "book":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.author,
        description: entry.data.description,
        topics: entry.data.topics,
        image: entry.data.coverImage,
        originalTitle: entry.data.originalTitle,
        isbn: entry.data.isbn,
        sourceUrl:
          typeof entry.data.sourceUrl === "string"
            ? entry.data.sourceUrl
            : undefined,
      };
    case "article":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.author,
        description: entry.data.description,
        topics: entry.data.topics,
        image: entry.data.editorialImage,
        sourceUrl:
          typeof entry.data.sourceUrl === "string"
            ? entry.data.sourceUrl
            : undefined,
        readingTime: entry.data.readingTime,
      };
    case "video":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.author,
        description: entry.data.description,
        topics: entry.data.topics,
        image: entry.data.thumbnail,
        sourceUrl:
          typeof entry.data.sourceUrl === "string"
            ? entry.data.sourceUrl
            : undefined,
        duration: entry.data.duration,
      };
    case "podcast":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.author,
        description: entry.data.description,
        topics: entry.data.topics,
        image: entry.data.thumbnail,
        sourceUrl:
          typeof entry.data.sourceUrl === "string"
            ? entry.data.sourceUrl
            : undefined,
        duration: entry.data.duration,
        episodeNumber: entry.data.episodeNumber,
      };
    case "paper":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.author,
        description: entry.data.description,
        topics: entry.data.topics,
        originalTitle: entry.data.originalTitle,
        sourceUrl:
          typeof entry.data.sourceUrl === "string"
            ? entry.data.sourceUrl
            : undefined,
        journal: entry.data.journal,
        doi: entry.data.doi,
        citationCount: entry.data.citationCount,
        paperType: entry.data.paperType,
      };
    case "film":
      return {
        ...base,
        title: entry.data.title,
        author: entry.data.director,
        description: entry.data.description,
        topics: entry.data.topics,
        image: entry.data.posterImage,
        originalTitle: entry.data.originalTitle,
        duration: entry.data.duration,
        year: entry.data.year,
        country: entry.data.country,
        genre: entry.data.genre,
      };
  }
}

const collectionEntryPromises = new Map<CollectionName, Promise<AnyContentEntry[]>>();

let normalizedContentPromise: Promise<NormalizedContent[]> | undefined;

export async function getContentEntries<T extends CollectionName>(
  collectionName: T,
): Promise<ContentEntryForCollection<T>[]> {
  let entriesPromise = collectionEntryPromises.get(collectionName);

  if (!entriesPromise) {
    entriesPromise = getCollection(collectionName).then((entries) =>
      entries.map(
        (entry) =>
          ({
            ...entry,
            contentType: collectionToContentType[collectionName],
          }) as AnyContentEntry,
      ),
    );
    collectionEntryPromises.set(collectionName, entriesPromise);
  }

  return entriesPromise as Promise<ContentEntryForCollection<T>[]>;
}

export async function getAllContent(): Promise<AnyContentEntry[]> {
  const collections = await Promise.all(
    collectionNames.map((collectionName) => getContentEntries(collectionName)),
  );

  return collections.flat();
}

export async function getNormalizedContent(): Promise<NormalizedContent[]> {
  normalizedContentPromise ??= getAllContent().then((entries) =>
    entries.map(normalizeContent),
  );

  return normalizedContentPromise;
}

export function sortByNewest<T extends { date: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getLocaleContent(
  locale: Locale,
): Promise<NormalizedContent[]> {
  const content = await getNormalizedContent();
  return sortByNewest(
    content.filter((item) => isContentForLocale(item.slug, locale)),
  );
}

export async function getPublishedLocaleContent(
  locale: Locale,
): Promise<NormalizedContent[]> {
  const content = await getLocaleContent(locale);
  return content.filter((item) => {
    const data = item.original.data as { status?: string };
    return data.status === "published";
  });
}

export async function getPublishedCollectionEntries<T extends CollectionName>(
  collectionName: T,
  locale: Locale,
): Promise<CollectionEntry<T>[]> {
  const entries = await getContentEntries(collectionName);

  return sortByNewest(
    entries
      .map(normalizeContent)
      .filter((item) => {
        const data = item.original.data as { status?: string };
        return (
          data.status === "published" && isContentForLocale(item.slug, locale)
        );
      }),
  ).map((item) => item.original as CollectionEntry<T>);
}

export async function getCollectionEntriesForLocale<T extends CollectionName>(
  collectionName: T,
  locale: Locale,
): Promise<CollectionEntry<T>[]> {
  const entries = await getContentEntries(collectionName);
  return entries
    .filter((entry) => isContentForLocale(entry.id, locale))
    .map((entry) => entry as CollectionEntry<T>);
}

export async function getCollectionEntriesByLocale<T extends CollectionName>(
  collectionName: T,
  locales: readonly Locale[],
): Promise<Map<Locale, CollectionEntry<T>[]>> {
  const entries = await getContentEntries(collectionName);
  return new Map(
    locales.map((locale) => [
      locale,
      entries
        .filter((entry) => isContentForLocale(entry.id, locale))
        .map((entry) => entry as CollectionEntry<T>),
    ]),
  );
}

type DetailPathProps<
  T extends CollectionName,
  EntryKey extends string,
  EntriesKey extends string,
> = Record<EntryKey, CollectionEntry<T>> &
  Record<EntriesKey, CollectionEntry<T>[]>;

export async function getCollectionDetailPathsForLocale<
  T extends CollectionName,
  EntryKey extends string,
  EntriesKey extends string,
>(
  collectionName: T,
  locale: Locale,
  entryKey: EntryKey,
  entriesKey: EntriesKey,
): Promise<
  Array<{
    params: { slug: string };
    props: DetailPathProps<T, EntryKey, EntriesKey>;
  }>
> {
  const entries = await getCollectionEntriesForLocale(collectionName, locale);

  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      [entryKey]: entry,
      [entriesKey]: entries,
    } as DetailPathProps<T, EntryKey, EntriesKey>,
  }));
}

export async function getLocalizedCollectionDetailPaths<
  T extends CollectionName,
  EntryKey extends string,
  EntriesKey extends string,
>(
  collectionName: T,
  locales: readonly Locale[],
  entryKey: EntryKey,
  entriesKey: EntriesKey,
): Promise<
  Array<{
    params: { locale: Locale; slug: string };
    props: DetailPathProps<T, EntryKey, EntriesKey> & { locale: Locale };
  }>
> {
  const entriesByLocale = await getCollectionEntriesByLocale(
    collectionName,
    locales,
  );

  return locales.flatMap((locale) => {
    const entries = entriesByLocale.get(locale) ?? [];

    return entries.map((entry) => ({
      params: { locale, slug: cleanLocalizedSlug(entry.id) },
      props: {
        [entryKey]: entry,
        [entriesKey]: entries,
        locale,
      } as DetailPathProps<T, EntryKey, EntriesKey> & { locale: Locale },
    }));
  });
}

export function getRelatedEntriesByTopics<
  T extends { id: string; data: { topics: string[] } },
>(entries: T[], currentEntry: T, limit = 3): T[] {
  return entries
    .filter(
      (entry) =>
        entry.id !== currentEntry.id &&
        entry.data.topics.some((topic) =>
          currentEntry.data.topics.includes(topic),
        ),
    )
    .slice(0, limit);
}

export async function buildCollectionDetailView<
  T extends CollectionEntry<CollectionName>,
>(entry: T, entries: T[], limit = 3) {
  const { Content } = await render(entry);

  return {
    Content,
    relatedEntries: getRelatedEntriesByTopics(entries, entry, limit),
  };
}

export async function getTopicContent(
  topic: string,
  locale: Locale,
): Promise<NormalizedContent[]> {
  const content = await getLocaleContent(locale);
  return content.filter((item) => item.topics.includes(topic));
}

export async function getAllTopicNames(): Promise<string[]> {
  const content = await getNormalizedContent();
  return [...new Set(content.flatMap((item) => item.topics))];
}

export async function getTopicCountsForLocale(
  locale: Locale,
): Promise<Record<string, number>> {
  const content = await getLocaleContent(locale);

  return content
    .flatMap((item) => item.topics)
    .reduce<Record<string, number>>((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
}

export function getRelatedTopicCounts(
  items: NormalizedContent[],
  currentTopic: string,
): Record<string, number> {
  return items
    .flatMap((item) => item.topics)
    .filter((topic) => topic !== currentTopic)
    .reduce<Record<string, number>>((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
}

export function getRelatedTopics(
  items: NormalizedContent[],
  currentTopic: string,
  limit = 6,
): string[] {
  return Object.entries(getRelatedTopicCounts(items, currentTopic))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic]) => topic);
}

export function groupContentByType<T extends { contentType: ContentType }>(
  items: T[],
): Record<ContentType, T[]> {
  return {
    book: items.filter((item) => item.contentType === "book"),
    article: items.filter((item) => item.contentType === "article"),
    video: items.filter((item) => item.contentType === "video"),
    podcast: items.filter((item) => item.contentType === "podcast"),
    paper: items.filter((item) => item.contentType === "paper"),
    film: items.filter((item) => item.contentType === "film"),
  };
}
