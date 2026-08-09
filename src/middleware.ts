import { defineMiddleware } from "astro:middleware";
import {
  defaultLocale,
  getLocalizedPath,
  locales,
  removeLocaleFromPath,
  type Locale,
} from "./i18n";

const LOCALE_COOKIE = "femres_locale";
const LOCALE_QUERY_PARAM = "locale";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const localizedPrefixes = locales.filter((locale) => locale !== defaultLocale);

function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

function getPathLocale(pathname: string): Locale | undefined {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : undefined;
}

function removeAnyLocalePrefix(pathname: string): string {
  const pathLocale = getPathLocale(pathname);
  if (!pathLocale) return pathname;

  return pathname.slice(`/${pathLocale}`.length) || "/";
}

function shouldHandleRequest(request: Request, pathname: string): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (
    firstSegment === "api" ||
    firstSegment === "_astro" ||
    firstSegment === "_vercel" ||
    firstSegment === ".well-known"
  ) {
    return false;
  }

  return !/\.[a-z0-9]+$/i.test(pathname);
}

function parsePreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((item) => {
      const [rawTag, ...params] = item.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;

      return {
        tag: rawTag.toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter(({ tag, q }) => tag.length > 0 && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    if (tag === "zh-tw" || tag === "zh-hk" || tag === "zh-mo" || tag === "zh-hant") {
      return "zh-TW";
    }
    if (tag === "zh-cn" || tag === "zh-sg" || tag === "zh-hans" || tag === "zh") {
      return "zh-CN";
    }
    if (tag === "en" || tag.startsWith("en-")) return "en";
    if (tag === "ja" || tag.startsWith("ja-")) return "ja";
    if (tag === "fr" || tag.startsWith("fr-")) return "fr";
  }

  return defaultLocale;
}

function buildCleanUrl(url: URL): string {
  const cleanUrl = new URL(url);
  cleanUrl.searchParams.delete(LOCALE_QUERY_PARAM);
  return `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`;
}

function buildLocalizedUrl(url: URL, locale: Locale): string {
  const cleanUrl = new URL(url);
  cleanUrl.searchParams.delete(LOCALE_QUERY_PARAM);

  const basePath = removeAnyLocalePrefix(removeLocaleFromPath(cleanUrl.pathname));
  cleanUrl.pathname = getLocalizedPath(basePath, locale);

  return `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`;
}

function addLocaleCookie(response: Response, locale: Locale, secure: boolean) {
  response.headers.append("Vary", "Accept-Language, Cookie");
  response.headers.append(
    "Set-Cookie",
    `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`,
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const pathname = url.pathname;

  if (!shouldHandleRequest(request, pathname)) {
    return next();
  }

  if (context.isPrerendered) {
    return next();
  }

  const queryLocale = url.searchParams.get(LOCALE_QUERY_PARAM);
  const pathLocale = getPathLocale(pathname);
  const secureCookie = url.protocol === "https:";

  if (isLocale(queryLocale)) {
    const targetUrl =
      queryLocale === defaultLocale ? buildCleanUrl(url) : buildLocalizedUrl(url, queryLocale);
    const response = context.redirect(targetUrl, 302);
    addLocaleCookie(response, queryLocale, secureCookie);
    return response;
  }

  if (pathLocale === defaultLocale) {
    const response = context.redirect(buildLocalizedUrl(url, defaultLocale), 301);
    addLocaleCookie(response, defaultLocale, secureCookie);
    return response;
  }

  if (pathLocale && localizedPrefixes.includes(pathLocale)) {
    const response = await next();
    response.headers.append("Vary", "Accept-Language, Cookie");
    response.headers.append(
      "Set-Cookie",
      `${LOCALE_COOKIE}=${encodeURIComponent(pathLocale)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureCookie ? "; Secure" : ""}`,
    );
    return response;
  }

  const cookieLocale = context.cookies.get(LOCALE_COOKIE)?.value;
  const preferredLocale = isLocale(cookieLocale)
    ? cookieLocale
    : parsePreferredLocale(request.headers.get("accept-language"));

  if (preferredLocale !== defaultLocale) {
    const response = context.redirect(buildLocalizedUrl(url, preferredLocale), 302);
    addLocaleCookie(response, preferredLocale, secureCookie);
    return response;
  }

  const response = await next();
  response.headers.append("Vary", "Accept-Language, Cookie");
  return response;
});
