import { findTopicByName } from "../i18n/topicsUtils";

export const dateTitleSortOptions = [
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
] as const;

export type DateTitleSortOption = (typeof dateTitleSortOptions)[number];

export const filmSortOptions = [
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
  "year-desc",
  "year-asc",
] as const;

export type FilmSortOption = (typeof filmSortOptions)[number];

export const videoSortOptions = [
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
  "duration-asc",
  "duration-desc",
] as const;

export type VideoSortOption = (typeof videoSortOptions)[number];

export const paperSortOptions = [
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
  "citations-desc",
  "citations-asc",
] as const;

export type PaperSortOption = (typeof paperSortOptions)[number];

interface PublishDateTitleItem {
  data: {
    publishDate: Date;
    title: string;
  };
}

interface FilmSortItem {
  data: {
    releaseDate: Date;
    title: string;
    year: number;
  };
}

interface VideoSortItem extends PublishDateTitleItem {
  data: PublishDateTitleItem["data"] & {
    duration?: string | number;
  };
}

interface PaperSortItem extends PublishDateTitleItem {
  data: PublishDateTitleItem["data"] & {
    citationCount?: number;
  };
}

export function getCanonicalTopicKey(topic: string): string {
  return findTopicByName(topic)?.key ?? topic;
}

export function compareByPublishDateAndTitle<T extends PublishDateTitleItem>(
  a: T,
  b: T,
  sort: DateTitleSortOption,
): number {
  switch (sort) {
    case "date-asc":
      return a.data.publishDate.getTime() - b.data.publishDate.getTime();
    case "title-asc":
      return a.data.title.localeCompare(b.data.title);
    case "title-desc":
      return b.data.title.localeCompare(a.data.title);
    case "date-desc":
    default:
      return b.data.publishDate.getTime() - a.data.publishDate.getTime();
  }
}

export function compareFilms<T extends FilmSortItem>(
  a: T,
  b: T,
  sort: FilmSortOption,
): number {
  switch (sort) {
    case "date-asc":
      return a.data.releaseDate.getTime() - b.data.releaseDate.getTime();
    case "title-asc":
      return a.data.title.localeCompare(b.data.title);
    case "title-desc":
      return b.data.title.localeCompare(a.data.title);
    case "year-desc":
      return b.data.year - a.data.year;
    case "year-asc":
      return a.data.year - b.data.year;
    case "date-desc":
    default:
      return b.data.releaseDate.getTime() - a.data.releaseDate.getTime();
  }
}

function getDurationValue(duration?: string | number): number {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  if (duration.includes(":")) {
    return duration
      .split(":")
      .map((part) => Number(part))
      .reduce((total, part) => total * 60 + (Number.isNaN(part) ? 0 : part), 0);
  }
  const parsed = Number(duration);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function compareVideos<T extends VideoSortItem>(
  a: T,
  b: T,
  sort: VideoSortOption,
): number {
  switch (sort) {
    case "date-asc":
      return a.data.publishDate.getTime() - b.data.publishDate.getTime();
    case "title-asc":
      return a.data.title.localeCompare(b.data.title);
    case "title-desc":
      return b.data.title.localeCompare(a.data.title);
    case "duration-asc":
      return getDurationValue(a.data.duration) - getDurationValue(b.data.duration);
    case "duration-desc":
      return getDurationValue(b.data.duration) - getDurationValue(a.data.duration);
    case "date-desc":
    default:
      return b.data.publishDate.getTime() - a.data.publishDate.getTime();
  }
}

export function comparePapers<T extends PaperSortItem>(
  a: T,
  b: T,
  sort: PaperSortOption,
): number {
  switch (sort) {
    case "date-asc":
      return a.data.publishDate.getTime() - b.data.publishDate.getTime();
    case "title-asc":
      return a.data.title.localeCompare(b.data.title);
    case "title-desc":
      return b.data.title.localeCompare(a.data.title);
    case "citations-desc":
      return (b.data.citationCount || 0) - (a.data.citationCount || 0);
    case "citations-asc":
      return (a.data.citationCount || 0) - (b.data.citationCount || 0);
    case "date-desc":
    default:
      return b.data.publishDate.getTime() - a.data.publishDate.getTime();
  }
}
