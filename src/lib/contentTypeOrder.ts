import type { ContentType } from "./content";

/** Shared presentation order for the six public resource types. */
export const EDITORIAL_CONTENT_TYPE_ORDER = [
  "book",
  "film",
  "video",
  "podcast",
  "article",
  "paper",
] as const satisfies readonly ContentType[];
