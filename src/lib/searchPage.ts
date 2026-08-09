import { createT, locales, type Locale } from "../i18n";
import type { TranslationFunction } from "../i18n/types";
import {
  getPublishedLocaleContent,
  groupContentByType,
  type ContentType,
} from "./content";
import { EDITORIAL_CONTENT_TYPE_ORDER } from "./contentTypeOrder";
import { buildSearchView } from "./search";

type SearchPathMode = "root" | "locale";

const searchContentTypeMetadata = {
  book: { labelKey: "nav.books", icon: "📚" },
  film: { labelKey: "nav.films", icon: "🎬" },
  video: { labelKey: "nav.videos", icon: "🎥" },
  podcast: { labelKey: "nav.podcasts", icon: "🎧" },
  article: { labelKey: "nav.articles", icon: "📰" },
  paper: { labelKey: "nav.papers", icon: "📄" },
} satisfies Record<ContentType, {
  labelKey: string;
  icon: string;
}>;

const searchContentTypeConfig = EDITORIAL_CONTENT_TYPE_ORDER.map((value) => ({
  value,
  countKey: value,
  ...searchContentTypeMetadata[value],
}));

export function getSearchStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

function getSearchPath(locale: Locale, pathMode: SearchPathMode): string {
  return pathMode === "locale" ? `/${locale}/search` : "/search";
}

function getSearchContentTypes(
  t: TranslationFunction,
  contentByType: ReturnType<typeof groupContentByType>,
) {
  return searchContentTypeConfig.map(({ value, labelKey, icon, countKey }) => ({
    value,
    label: t(labelKey),
    icon,
    count: contentByType[countKey].length,
  }));
}

export async function buildSearchPageData({
  locale,
  url,
  pathMode,
}: {
  locale: Locale;
  url: URL;
  pathMode: SearchPathMode;
}) {
  const t = createT(locale);
  const searchPath = getSearchPath(locale, pathMode);
  const allContent = await getPublishedLocaleContent(locale);
  const allContentByType = groupContentByType(allContent);
  const contentTypes = getSearchContentTypes(t, allContentByType);
  const contentTypeValues = contentTypes.map((item) => item.value);
  const view = buildSearchView({
    content: allContent,
    contentTypeValues,
    url,
    basePath: searchPath,
  });

  return {
    t,
    searchPath,
    allContent,
    contentTypes,
    ...view,
  };
}

export function getSearchArticleType(
  title: string,
): "news" | "blog" | "research" | "opinion" | "analysis" {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("report") ||
    titleLower.includes("data") ||
    titleLower.includes("报告") ||
    titleLower.includes("数据")
  ) {
    return "analysis";
  }

  if (
    titleLower.includes("status") ||
    titleLower.includes("metoo") ||
    titleLower.includes("现状")
  ) {
    return "news";
  }

  return "blog";
}
