import type { Locale } from "../i18n";
import { findTopicByName, getTopicTranslation } from "../i18n/topicsUtils";

export function getTranslatedTopicLabel(topic: string, locale: Locale): string {
  return findTopicByName(topic) ? getTopicTranslation(topic, locale) : topic;
}

export function getCurrentTopicLabel(
  topic: string,
  locale: Locale,
  allLabel: string,
): string {
  return topic === "all" ? allLabel : getTranslatedTopicLabel(topic, locale);
}
