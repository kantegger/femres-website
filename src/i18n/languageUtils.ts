import { getTranslationValue } from "./index";
import type { Locale } from "./types";

export function normalizeLanguageCode(code: string): string {
  const normalized = code.trim();
  const lower = normalized.toLowerCase();
  if (lower === "zh-cn") return "zh-CN";
  if (lower === "zh-tw") return "zh-TW";
  return lower;
}

export function getLanguageName(code: string | undefined, locale: Locale): string {
  if (!code) return "";
  const normalizedCode = normalizeLanguageCode(code);
  const translation = getTranslationValue(locale, `languages.${normalizedCode}`);
  return typeof translation === "string" && translation.trim().length > 0
    ? translation
    : normalizedCode;
}
