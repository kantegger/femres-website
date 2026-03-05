// i18n 类型定义
export type Locale = 'zh-CN' | 'en' | 'ja' | 'fr' | 'zh-TW';

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
  promo: {
    fatefuldeck: {
      supportedBy: string;
      title: string;
      description: string;
      cta: string;
      insightTitle: string;
      insightDescription: string;
      insightCta: string;
    };
  };
}

export interface Article {
  slug: string;
  title: string;
  author: string;
  description: string;
  featuredImage: string;
  publishDate: string;
  topics: string[];
  readingTime: number;
  sourceUrl: string;
}

export interface Book {
  slug: string;
  title: string;
  originalTitle?: string;
  author: string;
  description: string;
  coverImage: string;
  publishDate: string;
  topics: string[];
  isbn?: string;
}

export interface Film {
  slug: string;
  title: string;
  titleEn?: string;
  originalTitle?: string;
  director: string;
  description: string;
  descriptionEn?: string;
  posterImage: string;
  releaseDate: string;
  topics: string[];
  year: number;
  country: string;
  duration: string;
  genre: string[];
}

export interface Video {
  slug: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  thumbnail?: string;
  publishDate: string;
  formattedDate?: string;
  topics: string[];
  duration?: string | number;
  sourceUrl: string;
}

export interface Podcast {
  slug: string;
  title: string;
  author: string;
  description: string;
  publishDate: string;
  formattedDate?: string; // Optional field added in listing pages
  topics: string[];
  duration: string | number;
  formattedDuration?: string; // Optional field added in listing pages
  sourceUrl: string;
  thumbnail?: string; // Optional field added in listing pages
  episodeNumber?: number;
  formattedEpisode?: string; // Optional field added in listing pages
  linkUrl?: string; // Optional field added in listing pages
  cleanSlug?: string; // Optional field added in listing pages
}

export interface Paper {
  slug: string;
  title: string;
  author: string;
  description: string;
  publishDate: string;
  topics: string[];
  sourceUrl: string;
  journal?: string;
  doi?: string;
  citationCount?: number;
  paperType?: string;
  keywords?: string[];
}

export type TranslationFunction = (key: string, params?: Record<string, any>) => string;

declare global {
  interface Window {
    I18N: any;
    TOPIC_TRANSLATIONS: Record<string, string>;
    CURRENT_LOCALE: string;
    ALL_BOOKS_DATA?: Book[];
    ALL_FILMS_DATA?: Film[];
    ALL_ARTICLES_DATA?: Article[];
    ALL_VIDEOS_DATA?: Video[];
    ALL_PODCASTS_DATA?: Podcast[];
    ALL_PAPERS_DATA?: Paper[];
  }
}