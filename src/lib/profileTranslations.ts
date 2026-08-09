import { getTranslationValue, type Locale } from "../i18n";
import type { ProfileUiStrings, UserContentListStrings } from "../types/profile";

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function readTranslationObject(locale: Locale, key: string): Record<string, unknown> {
  const value = getTranslationValue(locale, key);
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new Error(`Expected translation object for ${key}`);
}

function readString(
  value: Record<string, unknown>,
  key: string,
  translationPath: string,
): string {
  const item = value[key];
  if (typeof item === "string") return item;

  throw new Error(`Expected string translation for ${translationPath}.${key}`);
}

export function getProfileUiStrings(locale: Locale): ProfileUiStrings {
  const value = readTranslationObject(locale, "profilePage.ui");

  return {
    usernameEmpty: readString(value, "usernameEmpty", "profilePage.ui"),
    updateFailed: readString(value, "updateFailed", "profilePage.ui"),
    loginRequired: readString(value, "loginRequired", "profilePage.ui"),
    loginDesc: readString(value, "loginDesc", "profilePage.ui"),
    home: readString(value, "home", "profilePage.ui"),
    editUsername: readString(value, "editUsername", "profilePage.ui"),
    likes: readString(value, "likes", "profilePage.ui"),
    bookmarks: readString(value, "bookmarks", "profilePage.ui"),
    joinDate: readString(value, "joinDate", "profilePage.ui"),
    logout: readString(value, "logout", "profilePage.ui"),
    myLikes: readString(value, "myLikes", "profilePage.ui"),
    myBookmarks: readString(value, "myBookmarks", "profilePage.ui"),
    contentCount: readString(value, "contentCount", "profilePage.ui"),
    quickActions: readString(value, "quickActions", "profilePage.ui"),
    browseBooks: readString(value, "browseBooks", "profilePage.ui"),
    readArticles: readString(value, "readArticles", "profilePage.ui"),
    exploreTopics: readString(value, "exploreTopics", "profilePage.ui"),
  };
}

export function getUserContentListStrings(
  locale: Locale,
): UserContentListStrings {
  const value = readTranslationObject(locale, "profilePage.contentList");

  if (!isStringRecord(value.types)) {
    throw new Error("Expected translation record for profilePage.contentList.types");
  }
  if (!isStringRecord(value.actions)) {
    throw new Error("Expected translation record for profilePage.contentList.actions");
  }
  if (!isStringRecord(value.items)) {
    throw new Error("Expected translation record for profilePage.contentList.items");
  }

  return {
    loginRequired: readString(value, "loginRequired", "profilePage.contentList"),
    loginDesc: readString(value, "loginDesc", "profilePage.contentList"),
    loading: readString(value, "loading", "profilePage.contentList"),
    noContent: readString(value, "noContent", "profilePage.contentList"),
    browseDesc: readString(value, "browseDesc", "profilePage.contentList"),
    author: readString(value, "author", "profilePage.contentList"),
    viewDetails: readString(value, "viewDetails", "profilePage.contentList"),
    viewModeLabel: readString(value, "viewModeLabel", "profilePage.contentList"),
    detailView: readString(value, "detailView", "profilePage.contentList"),
    visualView: readString(value, "visualView", "profilePage.contentList"),
    groupedView: readString(value, "groupedView", "profilePage.contentList"),
    showingCount: readString(value, "showingCount", "profilePage.contentList"),
    loadMore: readString(value, "loadMore", "profilePage.contentList"),
    loadingMore: readString(value, "loadingMore", "profilePage.contentList"),
    collectionPages: readString(value, "collectionPages", "profilePage.contentList"),
    groupPages: readString(value, "groupPages", "profilePage.contentList"),
    previousPage: readString(value, "previousPage", "profilePage.contentList"),
    nextPage: readString(value, "nextPage", "profilePage.contentList"),
    types: value.types,
    actions: value.actions,
    items: value.items,
  };
}
