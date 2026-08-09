import type { ContentType, NormalizedContent } from "./content";

export const searchSortOptions = [
  "relevance",
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
] as const;

export type SearchSortOption = (typeof searchSortOptions)[number];

export interface SearchViewOptions {
  content: NormalizedContent[];
  contentTypeValues: readonly ContentType[];
  url: URL;
  basePath: string;
  resultsPerPage?: number;
}

export interface SearchUrlOptions {
  q?: string;
  type?: string;
  topic?: string;
  sort?: SearchSortOption;
  page?: number;
}

export const DEFAULT_SEARCH_RESULTS_PER_PAGE = 24;

function buildSearchUrl(basePath: string, options: SearchUrlOptions): string {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.type) params.set("type", options.type);
  if (options.topic) params.set("topic", options.topic);
  if (options.sort && options.sort !== "relevance") {
    params.set("sort", options.sort);
  }
  if (options.page && options.page > 1) {
    params.set("page", options.page.toString());
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function matchesSearchQuery(item: NormalizedContent, query: string): boolean {
  if (!query) return true;

  return [item.title, item.author, item.description, ...item.topics]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function buildSearchView({
  content,
  contentTypeValues,
  url,
  basePath,
  resultsPerPage = DEFAULT_SEARCH_RESULTS_PER_PAGE,
}: SearchViewOptions) {
  const allTopics = [...new Set(content.flatMap((item) => item.topics))].sort();
  const currentQuery = url.searchParams.get("q")?.trim() || "";
  const normalizedQuery = currentQuery.toLowerCase();
  const requestedType = url.searchParams.get("type") || "";
  const currentType = contentTypeValues.includes(requestedType as ContentType)
    ? (requestedType as ContentType)
    : "";
  const requestedTopic = url.searchParams.get("topic") || "";
  const currentTopic = allTopics.includes(requestedTopic) ? requestedTopic : "";
  const requestedSort = url.searchParams.get("sort") || "relevance";
  const currentSort: SearchSortOption = searchSortOptions.includes(
    requestedSort as SearchSortOption,
  )
    ? (requestedSort as SearchSortOption)
    : "relevance";

  const filteredContent = content.filter((item) => {
    const typeMatch = !currentType || item.contentType === currentType;
    const topicMatch = !currentTopic || item.topics.includes(currentTopic);
    return typeMatch && topicMatch && matchesSearchQuery(item, normalizedQuery);
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (currentSort) {
      case "date-desc":
        return b.date.getTime() - a.date.getTime();
      case "date-asc":
        return a.date.getTime() - b.date.getTime();
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "relevance":
      default:
        return 0;
    }
  });

  const totalResults = sortedContent.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  const currentPage = Number(url.searchParams.get("page") || "1");
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  const currentItems = sortedContent.slice(
    (validPage - 1) * resultsPerPage,
    validPage * resultsPerPage,
  );

  const getSearchUrl = ({
    q = currentQuery,
    type = currentType,
    topic = currentTopic,
    sort = currentSort,
    page,
  }: SearchUrlOptions = {}) =>
    buildSearchUrl(basePath, { q, type, topic, sort, page });

  return {
    allTopics,
    currentQuery,
    currentType,
    currentTopic,
    currentSort,
    totalResults,
    totalPages,
    validPage,
    currentItems,
    baseUrl: getSearchUrl(),
    getSearchUrl,
  };
}
