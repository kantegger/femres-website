import type { CollectionEntry } from "astro:content";
import { createT, type Locale } from "../i18n";
import type { CollectionName } from "./content";
import { buildCollectionListingView } from "./listing";
import {
  compareByPublishDateAndTitle,
  dateTitleSortOptions,
} from "./listingSort";
import { getCurrentTopicLabel } from "./listingTopics";

type ListingPathMode = "root" | "locale";
type DateTitleCollectionName = Exclude<CollectionName, "films">;

function getListingBasePath(
  collectionName: CollectionName,
  locale: Locale,
  pathMode: ListingPathMode,
): string {
  return pathMode === "locale"
    ? `/${locale}/${collectionName}`
    : `/${collectionName}`;
}

export async function buildDateTitleListingPageData<
  T extends DateTitleCollectionName,
>({
  collectionName,
  locale,
  url,
  pathMode,
  perPage,
  featuredCount,
  allTopicLabelKey,
}: {
  collectionName: T;
  locale: Locale;
  url: URL;
  pathMode: ListingPathMode;
  perPage: number;
  featuredCount?: number;
  allTopicLabelKey: string;
}) {
  const t = createT(locale);
  const view = await buildCollectionListingView({
    collectionName,
    locale,
    url,
    basePath: getListingBasePath(collectionName, locale, pathMode),
    perPage,
    featuredCount,
    sortOptions: dateTitleSortOptions,
    defaultSort: "date-desc",
    compareItems: compareByPublishDateAndTitle,
  });

  return {
    t,
    currentTopicLabel: getCurrentTopicLabel(
      view.currentTopic,
      locale,
      t(allTopicLabelKey),
    ),
    ...view,
  };
}

export function getArticleListingType(
  article: CollectionEntry<"articles">,
): "news" | "blog" | "research" | "opinion" | "analysis" {
  const title = article.data.title.toLowerCase();

  if (
    title.includes("分析") ||
    title.includes("研究") ||
    title.includes("analysis") ||
    title.includes("research")
  ) {
    return "research";
  }

  return "blog";
}
