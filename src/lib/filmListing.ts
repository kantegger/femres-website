import type { CollectionEntry } from "astro:content";
import { createT, type Locale } from "../i18n";
import { getCanonicalGenre } from "../i18n/genreUtils";
import { getCanonicalRegion, getRegionTranslation } from "../i18n/regionUtils";
import type { TranslationFunction } from "../i18n/types";
import { buildCollectionListingView, type ListingFilter } from "./listing";
import {
  compareFilms,
  filmSortOptions,
  getCanonicalTopicKey,
  type FilmSortOption,
} from "./listingSort";
import { getCurrentTopicLabel } from "./listingTopics";

type FilmEntry = CollectionEntry<"films">;

export function getFilmCountries(films: FilmEntry[]): string[] {
  return [...new Set(films.map((film) => getCanonicalRegion(film.data.country)))]
    .filter(Boolean)
    .sort();
}

export function getFilmGenres(films: FilmEntry[]): string[] {
  return [...new Set(films.flatMap((film) => film.data.genre || []).map(getCanonicalGenre))]
    .filter(Boolean)
    .sort();
}

export function getFilmListingTopics(film: FilmEntry): string[] {
  return [
    ...film.data.topics,
    ...film.data.topics.map(getCanonicalTopicKey),
  ];
}

export function createFilmCountryFilter(
  films: FilmEntry[],
): ListingFilter<FilmEntry> {
  return {
    name: "country",
    values: getFilmCountries(films),
    matches: (film, country) => getCanonicalRegion(film.data.country) === country,
  };
}

export function getFilmFilterLabel({
  currentTopic,
  currentTopicLabel,
  currentCountry,
  locale,
  t,
}: {
  currentTopic: string;
  currentTopicLabel: string;
  currentCountry: string;
  locale: Locale;
  t: TranslationFunction;
}): string {
  const currentCountryLabel = currentCountry === "all"
    ? t("filmsPage.country.all")
    : getRegionTranslation(currentCountry, locale);

  if (currentTopic === "all" && currentCountry === "all") {
    return t("filmsPage.allFilmsHeading");
  }

  if (currentTopic !== "all" && currentCountry !== "all") {
    return `${currentTopicLabel} · ${currentCountryLabel}`;
  }

  return currentTopic !== "all" ? currentTopicLabel : currentCountryLabel;
}

export async function buildFilmListingPageData({
  locale,
  url,
  basePath,
  perPage = 12,
  featuredCount,
}: {
  locale: Locale;
  url: URL;
  basePath: string;
  perPage?: number;
  featuredCount?: number;
}) {
  const t = createT(locale);
  const view = await buildCollectionListingView({
    collectionName: "films",
    locale,
    url,
    basePath,
    perPage,
    featuredCount,
    sortOptions: filmSortOptions,
    defaultSort: "date-desc",
    getTopics: getFilmListingTopics,
    compareItems: compareFilms,
    createExtraFilters: (films) => [createFilmCountryFilter(films)],
  });
  const allCountries = getFilmCountries(view.sourceItems);
  const allGenres = getFilmGenres(view.sourceItems);
  const currentCountry = view.currentFilters.country ?? "all";
  const currentTopicLabel = getCurrentTopicLabel(
    view.currentTopic,
    locale,
    t("filmsPage.topics.all"),
  );
  const currentFilterLabel = getFilmFilterLabel({
    currentTopic: view.currentTopic,
    currentTopicLabel,
    currentCountry,
    locale,
    t,
  });

  const getFilmsUrl = ({
    topic = view.currentTopic,
    country = currentCountry,
    sort = view.currentSort,
    page,
  }: {
    topic?: string;
    country?: string;
    sort?: FilmSortOption;
    page?: number;
  } = {}) =>
    view.getListingUrl({ topic, sort, page, filters: { country } });

  return {
    ...view,
    t,
    allCountries,
    allGenres,
    currentCountry,
    currentTopicLabel,
    currentFilterLabel,
    getFilmsUrl,
  };
}
