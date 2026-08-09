export const SITE_ORIGIN = "https://www.femres.org";

export const SEO_LOCALES = ["zh-CN", "en", "ja", "fr", "zh-TW"];

const NON_DEFAULT_LOCALES = SEO_LOCALES.filter((locale) => locale !== "zh-CN");
const NOINDEX_ROUTE_PATTERN =
  /^\/(?:search(?:\/|$)|profile(?:\/|$)|unsubscribe(?:\/|$)|404(?:\/|$))/;

function getPathname(pathOrUrl) {
  try {
    return new URL(pathOrUrl, SITE_ORIGIN).pathname;
  } catch {
    return "/";
  }
}

export function removeSeoLocalePrefix(pathOrUrl) {
  const pathname = getPathname(pathOrUrl);
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!SEO_LOCALES.includes(firstSegment)) return pathname;

  return pathname.slice(`/${firstSegment}`.length) || "/";
}

export function normalizeCanonicalPath(pathOrUrl) {
  const pathname = getPathname(pathOrUrl).replace(/^\/zh-CN(?=\/|$)/, "") || "/";

  if (pathname === "/" || /\.[a-z0-9]+$/i.test(pathname)) return pathname;

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function buildCanonicalUrl(pathOrUrl) {
  return new URL(normalizeCanonicalPath(pathOrUrl), SITE_ORIGIN).href;
}

export function buildAlternateUrls(pathOrUrl) {
  const cleanPath = removeSeoLocalePrefix(pathOrUrl);
  const normalizedCleanPath = normalizeCanonicalPath(cleanPath);

  return Object.fromEntries(
    SEO_LOCALES.map((locale) => {
      const localizedPath =
        locale === "zh-CN"
          ? normalizedCleanPath
          : normalizeCanonicalPath(`/${locale}${normalizedCleanPath}`);

      return [locale, new URL(localizedPath, SITE_ORIGIN).href];
    }),
  );
}

export function isNoIndexPath(pathOrUrl) {
  return NOINDEX_ROUTE_PATTERN.test(removeSeoLocalePrefix(pathOrUrl));
}

export function shouldIncludeInSitemap(pageUrl) {
  const pathname = getPathname(pageUrl);

  return !pathname.startsWith("/zh-CN/") && !isNoIndexPath(pathname);
}

export function normalizeMetaDescription(value, maxLength = 180) {
  const description = String(value ?? "").replace(/\s+/g, " ").trim();
  if (description.length <= maxLength) return description;

  const clipped = description.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safeClip = lastSpace > maxLength * 0.7 ? clipped.slice(0, lastSpace) : clipped;

  return `${safeClip.trimEnd()}…`;
}

export { NON_DEFAULT_LOCALES };
