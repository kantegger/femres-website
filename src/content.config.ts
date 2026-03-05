import { defineCollection, z } from 'astro:content';

// 支持的内容语言列表 - 表示内容本身的语言
const supportedContentLanguages = [
  'zh-CN', 'en', 'zh-TW', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'pt', 'ru',
  'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'bem', 'ro', 'fa'
] as const;

// 定义内容集合的schema
const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    isbn: z.string().optional(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url().optional(),
    coverImage: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url(),
    readingTime: z.number().optional(),
    featuredImage: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const videos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url(),
    embedUrl: z.string().url().optional(),
    duration: z.number().optional(), // in minutes
    thumbnail: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const podcasts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url(),
    audioUrl: z.string().url().optional(),
    embedUrl: z.string().url().optional(),
    duration: z.number().optional(), // in minutes
    transcript: z.string().optional(),
    thumbnail: z.string().optional(),
    episodeNumber: z.number().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url(),
    doi: z.string().optional(),
    journal: z.string().optional(),
    abstract: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    citationCount: z.number().optional(),
    paperType: z.enum(['research', 'review', 'case-study', 'theoretical']).optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const films = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    director: z.string(),
    description: z.string(),
    releaseDate: z.date(),
    year: z.number(),
    country: z.string(),
    duration: z.string().optional(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    genre: z.array(z.string()).optional(),
    cast: z.array(z.string()).optional(),
    topics: z.array(z.string()),
    sourceUrl: z.array(z.object({
      platform: z.string(),
      url: z.string().url()
    })).optional(),
    posterImage: z.string().optional(),
    awards: z.array(z.string()).optional(),
    imdbRating: z.string().optional(),
    doubanRating: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    language: z.string().optional(),
    lastUpdated: z.date().optional(),
    intro: z.string().optional(),
  })
});

// 导出内容集合
export const collections = {
  books,
  articles,
  videos,
  podcasts,
  papers,
  films,
  pages
};

