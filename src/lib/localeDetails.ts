import type { Locale } from "../i18n";

export const localeDetailConfig = {
  en: { suffix: "-en", name: "English", dateLocale: "en-US" },
  "zh-CN": { suffix: "", name: "简体中文", dateLocale: "zh-CN" },
  "zh-TW": { suffix: "-tw", name: "繁體中文", dateLocale: "zh-TW" },
  ja: { suffix: "-ja", name: "日本語", dateLocale: "ja-JP" },
  fr: { suffix: "-fr", name: "Français", dateLocale: "fr-FR" },
} as const satisfies Record<
  Locale,
  { suffix: string; name: string; dateLocale: string }
>;

export type SupportedDetailLocale = keyof typeof localeDetailConfig;

export function isSupportedDetailLocale(
  value: string | undefined,
): value is SupportedDetailLocale {
  return Boolean(value && value in localeDetailConfig);
}

export const allDetailLocales = [
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "fr",
] as const satisfies readonly SupportedDetailLocale[];

export const nonDefaultDetailLocales = [
  "en",
  "zh-TW",
  "ja",
  "fr",
] as const satisfies readonly SupportedDetailLocale[];

export function getLocaleDateLocale(locale: SupportedDetailLocale): string {
  return localeDetailConfig[locale].dateLocale;
}

export function getLocaleStaticPaths(locales: readonly SupportedDetailLocale[]) {
  return locales.map((locale) => ({
    params: { locale },
  }));
}
