import { defineCollection, z } from 'astro:content';

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    author: z.string(),
    description: z.string(),
    publishDate: z.date(),
    isbn: z.string().optional(),
    contentLanguage: z.string().optional(),
    topics: z.array(z.string()),
    sourceUrl: z.string().optional(),
    coverImage: z.string().optional(),
    status: z.enum(['draft', 'published']),
    publisher: z.string().optional(),
    pages: z.number().optional(),
    purchaseLinks: z.array(z.object({
      vendor: z.string(),
      url: z.string()
    })).optional(),
  }),
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    author: z.string(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    publishDate: z.date(),
    topics: z.array(z.string()),
    sourceUrl: z.string().optional(),
    coverImage: z.string().optional(),
    featuredImage: z.string().optional(),
    status: z.enum(['draft', 'published']),
    readingTime: z.number().optional(),
    contentLanguage: z.string().optional(),
  }),
});

const films = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    originalTitle: z.string().optional(),
    director: z.string(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    posterImage: z.string().optional(),
    releaseDate: z.date(),
    year: z.number().optional(),
    country: z.string().optional(),
    duration: z.string().optional(),
    language: z.string().optional(),
    contentLanguage: z.string().optional(),
    sourceUrl: z.array(z.object({
      platform: z.string(),
      url: z.string()
    })).optional(),
    genre: z.array(z.string()).optional(),
    cast: z.array(z.string()).optional(),
    topics: z.array(z.string()),
    status: z.enum(['draft', 'published']),
    awards: z.array(z.string()).optional(),
    imdbRating: z.string().optional(),
    doubanRating: z.string().optional(),
  }),
});

const videos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    speaker: z.string().optional(),
    author: z.string().optional(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    publishDate: z.date(),
    topics: z.array(z.string()),
    sourceUrl: z.string().optional(),
    embedUrl: z.string().optional(),
    coverImage: z.string().optional(),
    thumbnail: z.string().optional(),
    status: z.enum(['draft', 'published']),
    duration: z.string().or(z.number()).optional(),
    platform: z.string().optional(),
    contentLanguage: z.string().optional(),
  }),
});

const podcasts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    titleEn: z.string().optional(),
    author: z.string(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    publishDate: z.date(),
    language: z.string().optional(),
    contentLanguage: z.string().optional(),
    topics: z.array(z.string()),
    sourceUrl: z.string().optional(),
    embedUrl: z.string().optional(),
    thumbnail: z.string().optional(),
    transcript: z.string().optional(),
    transcriptEn: z.string().optional(),
    status: z.enum(['draft', 'published']),
    duration: z.string().or(z.number()).optional(),
    episodeNumber: z.number().optional(),
  }),
});

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    originalTitle: z.string().optional(),
    author: z.string(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    publishDate: z.date(),
    language: z.string().optional(),
    contentLanguage: z.string().optional(),
    topics: z.array(z.string()),
    sourceUrl: z.string().optional(),
    doi: z.string().optional(),
    journal: z.string().optional(),
    abstract: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    paperType: z.string().optional(),
    status: z.enum(['draft', 'published']),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    language: z.string().optional(), // en, zh-CN, etc.
    lastUpdated: z.date().optional(),
    intro: z.string().optional(),
  }),
});

export const collections = {
  books,
  articles,
  films,
  videos,
  podcasts,
  papers,
  pages,
};