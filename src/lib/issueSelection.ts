import type { ContentType, NormalizedContent } from "./content";

export type IssueMediaQuotas = Record<ContentType, number>;

export interface IssueSelectionOptions {
  /** Hard ceilings for each medium. Unused seats are not reassigned to another medium. */
  mediaQuotas?: IssueMediaQuotas;
  /** Editorial anchors selected before relevance/date fallbacks. */
  curatedSlugs?: string[];
}

/** Return issue resources after removing entries reserved for another surface. */
export function getIssueBodyItems(
  issueItems: NormalizedContent[],
  excludedItems: NormalizedContent[],
): NormalizedContent[] {
  const excludedSlugs = new Set(excludedItems.map((item) => item.cleanSlug));
  return issueItems.filter((item) => !excludedSlugs.has(item.cleanSlug));
}

interface RankedIssueItem {
  item: NormalizedContent;
  relevance: number;
}

export function selectIssueItems(
  content: NormalizedContent[],
  topics: string[],
  options: IssueSelectionOptions = {},
  limit = 30,
): NormalizedContent[] {
  const topicSet = new Set(topics);
  const curatedSlugs = options.curatedSlugs ?? [];
  const curatedSet = new Set(curatedSlugs);
  const ranked = content
    .map((item) => ({
      item,
      relevance: item.topics.filter((topic) => topicSet.has(topic)).length,
    }))
    .filter(
      ({ item, relevance }) =>
        relevance > 0 || curatedSet.has(item.cleanSlug),
    )
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.item.date.getTime() - a.item.date.getTime(),
    );

  const rankedBySlug = new Map(
    ranked.map((entry) => [entry.item.cleanSlug, entry]),
  );
  const selected: RankedIssueItem[] = [];
  const selectedIds = new Set<string>();
  const mediaCounts = new Map<ContentType, number>();

  const add = (entry: RankedIssueItem | undefined) => {
    if (!entry || selectedIds.has(entry.item.id) || selected.length >= limit) {
      return;
    }

    const type = entry.item.contentType;
    const count = mediaCounts.get(type) ?? 0;
    const quota = options.mediaQuotas?.[type];
    if (quota !== undefined && count >= quota) return;

    selected.push(entry);
    selectedIds.add(entry.item.id);
    mediaCounts.set(type, count + 1);
  };

  curatedSlugs.forEach((slug) => add(rankedBySlug.get(slug)));
  ranked.forEach(add);

  return selected.map(({ item }) => item);
}
