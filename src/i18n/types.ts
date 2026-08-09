// i18n 类型定义
export type Locale = 'zh-CN' | 'en' | 'ja' | 'fr' | 'zh-TW';
export type TranslationParam = string | number | undefined;
export type TranslationValue =
  | string
  | number
  | boolean
  | null
  | RuntimeTranslationTree
  | TranslationValue[];

export interface RuntimeTranslationTree {
  [key: string]: TranslationValue;
}

export interface TranslationKeys {
  nav: {
    home: string;
    content: string;
    books: string;
    articles: string;
    films: string;
    videos: string;
    podcasts: string;
    papers: string;
    topics: string;
    search: string;
    contribute: string;
  };
  common: {
    readMore: string;
    viewAll: string;
    loading: string;
    language: string;
    publishDate: string;
    author: string;
    director: string;
    duration: string;
    pages: string;
    siteDescription: string;
    toggleTheme: string;
    toggleMenu: string;
  };
  homepage: {
    hero: {
      badge: string;
      title: string;
      titleHighlight: string;
      titleEnd: string;
      subtitle: string;
      startExploring: string;
      learnMore: string;
    };
    features: {
      richContent: {
        title: string;
        description: string;
      };
      smartCategories: {
        title: string;
        description: string;
      };
      globalPerspective: {
        title: string;
        description: string;
      };
    };
    sections: {
      featured: string;
      latestBooks: string;
      latestFilms: string;
      latestArticles: string;
      latestVideos: string;
      latestPodcasts: string;
      latestPapers: string;
      popularTopics: string;
    };
    cta: {
      title: string;
      description: string;
      contribute: string;
      aboutUs: string;
    };
  };
}

export type TranslationFunction = (
  key: string,
  params?: Record<string, TranslationParam>
) => string;

declare global {
  interface Window {
    I18N: Record<string, string>;
    TOPIC_TRANSLATIONS: Record<string, string>;
    CURRENT_LOCALE: string;
  }
}
