import topicsMapping from "../i18n/topicsMapping.json";
import type { Locale } from "../i18n";
import {
  type ContentType,
  getPublishedLocaleContent,
  groupContentByType,
  type NormalizedContent,
} from "./content";
import { issueDefinitions } from "./issues";

export type HomeArticleType =
  | "news"
  | "blog"
  | "research"
  | "opinion"
  | "analysis";

type TopicMappingEntry = Partial<Record<Locale | "icon", string>>;

export interface HomePopularTopic {
  topic: string;
  count: number;
  label: string;
  icon: string;
  gradient: string;
  progressWidth: number;
}

export interface HomePageData {
  latestBooks: NormalizedContent[];
  latestFilms: NormalizedContent[];
  latestArticles: NormalizedContent[];
  latestVideos: NormalizedContent[];
  latestPodcasts: NormalizedContent[];
  latestPapers: NormalizedContent[];
  enrichedArticles: Array<
    NormalizedContent & { articleType: HomeArticleType }
  >;
  popularTopics: HomePopularTopic[];
  issue: {
    cover: NormalizedContent;
    connections: NormalizedContent[];
    archive: NormalizedContent[];
  };
  contentCounts: Record<ContentType, number>;
}

const topicMappings = topicsMapping as Record<string, TopicMappingEntry>;

const topicGradients = [
  "from-purple-500 to-pink-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-blue-500 to-indigo-500",
  "from-teal-500 to-green-500",
  "from-violet-500 to-purple-500",
];

function getLocalizedTopicName(topic: string, locale: Locale): string {
  const mapping = topicMappings[topic];
  return mapping?.[locale] || mapping?.en || topic;
}

function getTopicIcon(topic: string): string {
  return topicMappings[topic]?.icon || "📋";
}

function inferArticleType(article: NormalizedContent): HomeArticleType {
  const title = article.title.toLowerCase();

  if (
    article.title.includes("报告") ||
    article.title.includes("数据") ||
    title.includes("report") ||
    title.includes("data")
  ) {
    return "analysis";
  }

  if (
    article.title.includes("现状") ||
    article.title.includes("MeToo") ||
    title.includes("news")
  ) {
    return "news";
  }

  return "blog";
}

function buildPopularTopics(
  content: NormalizedContent[],
  locale: Locale,
): HomePopularTopic[] {
  const topicCounts = content.reduce<Record<string, number>>((acc, item) => {
    item.topics.forEach((topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
    });
    return acc;
  }, {});

  const topics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxCount = Math.max(1, ...topics.map(([, count]) => count));

  return topics.map(([topic, count], index) => ({
    topic,
    count,
    label: getLocalizedTopicName(topic, locale),
    icon: getTopicIcon(topic),
    gradient: topicGradients[index % topicGradients.length],
    progressWidth: Math.min(100, (count / maxCount) * 100),
  }));
}

export interface LibraryPageData {
  popularTopics: HomePopularTopic[];
  contentCounts: Record<ContentType, number>;
  totalCount: number;
}

export async function buildLibraryPageData(
  locale: Locale,
): Promise<LibraryPageData> {
  const content = await getPublishedLocaleContent(locale);
  const contentByType = groupContentByType(content);

  return {
    popularTopics: buildPopularTopics(content, locale),
    contentCounts: {
      book: contentByType.book.length,
      film: contentByType.film.length,
      article: contentByType.article.length,
      video: contentByType.video.length,
      podcast: contentByType.podcast.length,
      paper: contentByType.paper.length,
    },
    totalCount: content.length,
  };
}

export async function buildHomePageData(
  locale: Locale,
): Promise<HomePageData> {
  const content = await getPublishedLocaleContent(locale);
  const contentByType = groupContentByType(content);

  const latestBooks = contentByType.book.slice(0, 3);
  const latestFilms = contentByType.film.slice(0, 3);
  const latestArticles = contentByType.article.slice(0, 2);
  const latestVideos = contentByType.video.slice(0, 2);
  const latestPodcasts = contentByType.podcast.slice(0, 4);
  const latestPapers = contentByType.paper.slice(0, 3);

  const findBySlug = (slug: string) =>
    content.find((item) => item.cleanSlug === slug);
  const currentIssue =
    issueDefinitions.find((definition) => definition.current) ??
    issueDefinitions[0];
  const cover = findBySlug(currentIssue?.coverSlug ?? "") ?? latestFilms[0];
  const connectionSlugs = currentIssue?.connectionSlugs ?? [];
  const connections = connectionSlugs
    .map(findBySlug)
    .filter((item): item is NormalizedContent => Boolean(item));
  const archive = content
    .filter(
      (item) =>
        item.id !== cover?.id &&
        !connections.some((connection) => connection.id === item.id),
    )
    .slice(0, 6);

  if (!cover) {
    throw new Error(`Homepage cover content is unavailable for ${locale}`);
  }

  return {
    latestBooks,
    latestFilms,
    latestArticles,
    latestVideos,
    latestPodcasts,
    latestPapers,
    enrichedArticles: latestArticles.map((article) => ({
      ...article,
      articleType: inferArticleType(article),
    })),
    popularTopics: buildPopularTopics(content, locale),
    issue: {
      cover,
      connections,
      archive,
    },
    contentCounts: {
      book: contentByType.book.length,
      film: contentByType.film.length,
      article: contentByType.article.length,
      video: contentByType.video.length,
      podcast: contentByType.podcast.length,
      paper: contentByType.paper.length,
    },
  };
}
