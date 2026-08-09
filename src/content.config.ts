import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 支持的内容语言列表 - 表示内容本身的语言
const supportedContentLanguages = [
  'zh-CN', 'en', 'zh-TW', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'pt', 'ru',
  'ar', 'hi', 'ur', 'pa', 'bn', 'ml', 'ne', 'si', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'bem', 'bm', 'sw', 'ro', 'fa'
] as const;

// 定义内容集合的schema
const books = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    contentLanguage: z.enum(supportedContentLanguages).default('zh-CN'),
    topics: z.array(z.string()),
    sourceUrl: z.string().url(),
    readingTime: z.number().optional(),
    // Historical source-page capture. It may be shown as a small source
    // preview, but is not treated as editorial artwork.
    featuredImage: z.string().optional(),
    // Optional, deliberately selected FemRes artwork for exceptional features.
    editorialImage: z.string().url().optional(),
    editorialImageAlt: z.string().optional(),
    editorialImageCredit: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/podcasts' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/films' }),
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
    verificationSources: z.array(z.object({
      platform: z.string(),
      url: z.string().url()
    })).optional(),
    posterImage: z.string().optional(),
    awards: z.array(z.string()).optional(),
    imdbRating: z.string().optional(),
    doubanRating: z.string().optional(),
    ratingsUpdatedAt: z.date().optional(),
    status: z.enum(['published', 'draft']).default('published')
  })
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
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
