import type { Locale } from "../i18n";
import type { TranslationFunction } from "../i18n/types";
import {
  getTopicSlug,
  getTopicTranslation,
  resolveTopicFromUrl,
} from "../i18n/topicsUtils";
import {
  getPublishedLocaleContent,
  getRelatedTopicCounts,
  getRelatedTopics,
  getTopicContent,
  groupContentByType,
  type ContentType,
} from "./content";
import { EDITORIAL_CONTENT_TYPE_ORDER } from "./contentTypeOrder";

const topicTypeParams: Record<ContentType, string> = {
  book: "books",
  film: "films",
  video: "videos",
  podcast: "podcasts",
  article: "articles",
  paper: "papers",
};

export const topicTypeEntries = EDITORIAL_CONTENT_TYPE_ORDER.map((contentType) => ({
  param: topicTypeParams[contentType],
  contentType,
}));

export type TopicTypeEntry = (typeof topicTypeEntries)[number];

type PublishedLocaleContent = Awaited<
  ReturnType<typeof getPublishedLocaleContent>
>;

function getTopicNamesForContent(content: PublishedLocaleContent) {
  return [...new Set(content.flatMap((item) => item.topics))];
}

function getTopicTypeEntry(contentType: ContentType) {
  const typeEntry = topicTypeEntries.find(
    (entry) => entry.contentType === contentType,
  );

  if (!typeEntry) {
    throw new Error(`Missing topic route mapping for ${contentType}`);
  }

  return typeEntry;
}

export function getTopicTypeLabels(
  t: TranslationFunction,
): Record<ContentType, string> {
  return {
    book: t("nav.books"),
    film: t("nav.films"),
    article: t("nav.articles"),
    video: t("nav.videos"),
    podcast: t("nav.podcasts"),
    paper: t("nav.papers"),
  };
}

export async function getTopicDetailStaticPaths() {
  const content = await getPublishedLocaleContent("zh-CN");
  const allTopics = getTopicNamesForContent(content);

  return allTopics.map((topic) => ({
    params: { topic: getTopicSlug(topic) },
    props: { topic },
  }));
}

export async function getLocalizedTopicDetailStaticPaths(
  locales: readonly Locale[],
) {
  const localizedPaths = await Promise.all(
    locales.map(async (locale) => {
      const content = await getPublishedLocaleContent(locale);
      return getTopicNamesForContent(content).map((topic) => ({
        params: { locale, topic: getTopicSlug(topic) },
        props: { topic },
      }));
    }),
  );

  return localizedPaths.flat();
}

export async function getTopicTypeStaticPaths() {
  const content = await getPublishedLocaleContent("zh-CN");
  const paths = [];
  const seen = new Set<string>();

  for (const item of content) {
    const typeObj = getTopicTypeEntry(item.contentType);
    for (const topic of item.topics) {
      const topicSlug = getTopicSlug(topic);
      const key = `${topicSlug}/${typeObj.param}`;
      if (seen.has(key)) continue;
      seen.add(key);
      paths.push({
        params: { topic: topicSlug, type: typeObj.param },
        props: { topic, typeObj },
      });
    }
  }

  return paths;
}

export async function getLocalizedTopicTypeStaticPaths(
  locales: readonly Locale[],
) {
  const localizedPaths = await Promise.all(
    locales.map(async (locale) => {
      const content = await getPublishedLocaleContent(locale);
      const paths = [];
      const seen = new Set<string>();

      for (const item of content) {
        const typeObj = getTopicTypeEntry(item.contentType);
        for (const topic of item.topics) {
          const topicSlug = getTopicSlug(topic);
          const key = `${topicSlug}/${typeObj.param}`;
          if (seen.has(key)) continue;
          seen.add(key);
          paths.push({
            params: { locale, topic: topicSlug, type: typeObj.param },
            props: { topic, typeObj },
          });
        }
      }

      return paths;
    }),
  );

  return localizedPaths.flat();
}

export async function buildTopicDetailView(topic: string, locale: Locale) {
  const decodedTopic = resolveTopicFromUrl(topic);
  const translatedTopic = getTopicTranslation(decodedTopic, locale);
  const topicContent = await getTopicContent(decodedTopic, locale);
  const contentByType = groupContentByType(topicContent);

  return {
    decodedTopic,
    translatedTopic,
    topicContent,
    contentByType,
    books: contentByType.book,
    films: contentByType.film,
    articles: contentByType.article,
    videos: contentByType.video,
    podcasts: contentByType.podcast,
    papers: contentByType.paper,
    relatedTopics: getRelatedTopicCounts(topicContent, decodedTopic),
    topRelatedTopics: getRelatedTopics(topicContent, decodedTopic),
  };
}

export async function buildTopicTypeView(
  topic: string,
  typeObj: TopicTypeEntry,
  locale: Locale,
  t: TranslationFunction,
) {
  const decodedTopic = resolveTopicFromUrl(topic);
  const translatedTopic = getTopicTranslation(decodedTopic, locale);
  const typeLabels = getTopicTypeLabels(t);
  const topicContent = await getTopicContent(decodedTopic, locale);
  const typeContent = topicContent.filter(
    (item) => item.contentType === typeObj.contentType,
  );

  return {
    decodedTopic,
    translatedTopic,
    topicContent,
    typeContent,
    typeLabels,
  };
}
