import type { CollectionEntry } from "astro:content";
import type { Locale } from "../i18n";
import {
  getPublishedCollectionEntries,
  type CollectionName,
} from "./content";

export interface TopicListingOptions<T, SortOption extends string> {
  items: T[];
  url: URL;
  basePath: string;
  perPage: number;
  /**
   * Number of leading items reserved for featured treatment on page 1 only.
   * Page 1 holds featuredCount + perPage items; pages >= 2 hold perPage items.
   */
  featuredCount?: number;
  sortOptions: readonly SortOption[];
  defaultSort: SortOption;
  getTopics: (item: T) => string[];
  compareItems: (a: T, b: T, sort: SortOption) => number;
  extraFilters?: readonly ListingFilter<T>[];
}

export interface ListingUrlOptions<SortOption extends string> {
  topic?: string;
  sort?: SortOption;
  page?: number;
  filters?: Record<string, string>;
}

export interface ListingFilter<T> {
  name: string;
  values: readonly string[];
  defaultValue?: string;
  matches: (item: T, value: string) => boolean;
}

export interface CollectionListingOptions<
  T extends CollectionName,
  SortOption extends string,
> extends Omit<
    TopicListingOptions<CollectionEntry<T>, SortOption>,
    "items" | "getTopics"
  > {
  collectionName: T;
  locale: Locale;
  getTopics?: (item: CollectionEntry<T>) => string[];
  createExtraFilters?: (
    items: CollectionEntry<T>[],
  ) => readonly ListingFilter<CollectionEntry<T>>[];
}

function buildListingUrl<SortOption extends string>({
  basePath,
  defaultSort,
  topic,
  sort,
  page,
  filters = {},
}: ListingUrlOptions<SortOption> & {
  basePath: string;
  defaultSort: SortOption;
}) {
  const params = new URLSearchParams();
  if (topic && topic !== "all") params.set("topic", topic);
  Object.entries(filters).forEach(([name, value]) => {
    if (value && value !== "all") params.set(name, value);
  });
  if (sort && sort !== defaultSort) params.set("sort", sort);
  if (page && page > 1) params.set("page", page.toString());

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildTopicListingView<T, SortOption extends string>({
  items,
  url,
  basePath,
  perPage,
  featuredCount = 0,
  sortOptions,
  defaultSort,
  getTopics,
  compareItems,
  extraFilters = [],
}: TopicListingOptions<T, SortOption>) {
  const allTopics = [...new Set(items.flatMap(getTopics))].sort();
  const requestedTopic = url.searchParams.get("topic") || "all";
  const currentTopic = allTopics.includes(requestedTopic)
    ? requestedTopic
    : "all";
  const requestedSort = url.searchParams.get("sort") || defaultSort;
  const currentSort = sortOptions.includes(requestedSort as SortOption)
    ? (requestedSort as SortOption)
    : defaultSort;
  const currentFilters = Object.fromEntries(
    extraFilters.map((filter) => {
      const defaultValue = filter.defaultValue ?? "all";
      const requestedValue = url.searchParams.get(filter.name) || defaultValue;
      const currentValue = filter.values.includes(requestedValue)
        ? requestedValue
        : defaultValue;
      return [filter.name, currentValue];
    }),
  );

  const filteredItems = items.filter((item) => {
    const topicMatches =
      currentTopic === "all" || getTopics(item).includes(currentTopic);
    const extraFiltersMatch = extraFilters.every((filter) => {
      const value = currentFilters[filter.name] ?? filter.defaultValue ?? "all";
      return value === "all" || filter.matches(item, value);
    });

    return topicMatches && extraFiltersMatch;
  });
  const visibleItems = [...filteredItems].sort((a, b) =>
    compareItems(a, b, currentSort),
  );

  const totalItems = items.length;
  const visibleTotal = visibleItems.length;
  const firstPageCapacity = featuredCount + perPage;
  const totalPages = Math.max(
    1,
    visibleTotal <= firstPageCapacity
      ? 1
      : 1 + Math.ceil((visibleTotal - firstPageCapacity) / perPage),
  );
  const currentPage = Number(url.searchParams.get("page") || "1");
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  const featuredItems =
    validPage === 1 ? visibleItems.slice(0, featuredCount) : [];
  const currentItems =
    validPage === 1
      ? visibleItems.slice(featuredCount, firstPageCapacity)
      : visibleItems.slice(
          firstPageCapacity + (validPage - 2) * perPage,
          firstPageCapacity + (validPage - 1) * perPage,
        );

  const getListingUrl = ({
    topic = currentTopic,
    sort = currentSort,
    page,
    filters = currentFilters,
  }: ListingUrlOptions<SortOption> = {}) =>
    buildListingUrl({
      basePath,
      defaultSort,
      topic,
      sort,
      page,
      filters,
    });

  return {
    allTopics,
    currentTopic,
    currentSort,
    currentFilters,
    totalItems,
    visibleTotal,
    totalPages,
    validPage,
    featuredItems,
    currentItems,
    baseUrl: getListingUrl(),
    getListingUrl,
  };
}

export async function buildCollectionListingView<
  T extends CollectionName,
  SortOption extends string,
>({
  collectionName,
  locale,
  getTopics = (item) => item.data.topics,
  createExtraFilters,
  ...options
}: CollectionListingOptions<T, SortOption>) {
  const items = await getPublishedCollectionEntries(collectionName, locale);
  const extraFilters = [
    ...(options.extraFilters ?? []),
    ...(createExtraFilters?.(items) ?? []),
  ];

  const view = buildTopicListingView({
    ...options,
    items,
    getTopics,
    extraFilters,
  });

  return {
    ...view,
    sourceItems: items,
  };
}
