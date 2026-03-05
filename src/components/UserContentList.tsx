import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  description: string;
  type: 'book' | 'article' | 'video' | 'podcast' | 'paper' | 'film';
  slug: string;
  coverImage?: string;
  publishDate: string;
}

// ... imports

interface UserContentListProps {
  type: 'likes' | 'bookmarks';
  locale?: string;
  uiStrings?: Record<string, any>;
}

export default function UserContentList({ type, locale = 'zh-CN', uiStrings }: UserContentListProps) {
  const { interactions, isAuthenticated } = useAuthStore();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to safely get nested translation or fallback
  const getUiString = (key: string, params?: Record<string, string>) => {
    if (!uiStrings) return '';

    // Handle nested keys like "types.book"
    const keys = key.split('.');
    let value: any = uiStrings;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break; // Break if key not found
    }

    if (typeof value !== 'string') return key; // Fallback or empty

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] || '');
    }
    return value;
  };


  useEffect(() => {
    const loadContent = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      const contentIds = type === 'likes' ? interactions.likes : interactions.bookmarks;

      // Fetch content by making API calls to get actual content data
      const contentPromises = contentIds.map(async (id) => {
        const [contentType, ...slugParts] = id.split('-');
        const slug = slugParts.join('-');

        try {
          // Fetch content from the appropriate collection endpoint
          // Note: API endpoint currently returns raw data, might need locale adjustment if API supports it
          const response = await fetch(`/api/content/${contentType}/${slug}`);
          if (response.ok) {
            const contentData = await response.json();
            return {
              id,
              title: contentData.title,
              author: contentData.author || contentData.director || contentData.speaker || '未知作者',
              description: contentData.description,
              type: contentType as ContentItem['type'],
              slug,
              coverImage: contentData.coverImage || contentData.posterImage || contentData.thumbnail || contentData.featuredImage,
              publishDate: contentData.publishDate || new Date().toISOString()
            };
          } else {
            // If API call fails, try to determine the correct content type and provide fallback
            const fallbackData = await getFallbackContentData(contentType, slug);
            if (fallbackData) {
              return {
                id,
                ...fallbackData,
                type: contentType as ContentItem['type'],
                slug,
                publishDate: new Date().toISOString()
              };
            }
          }
        } catch (error) {
          console.warn(`Failed to load content for ${id}:`, error);
          // Provide fallback data
          const fallbackData = await getFallbackContentData(contentType, slug);
          if (fallbackData) {
            return {
              id,
              ...fallbackData,
              type: contentType as ContentItem['type'],
              slug,
              publishDate: new Date().toISOString()
            };
          }
        }

        // Final fallback for invalid content
        return {
          id,
          title: '内容已删除或不存在',
          author: '未知',
          description: '此内容可能已被删除或移动。',
          type: contentType as ContentItem['type'] || 'article',
          slug: 'unknown',
          publishDate: new Date().toISOString()
        };
      });

      const loadedContent = await Promise.all(contentPromises);
      setContentItems(loadedContent.filter(Boolean) as ContentItem[]);
      setLoading(false);
    };

    // Helper function to provide better fallback content data
    const getFallbackContentData = async (contentType: string, slug: string) => {
      // Simplified fallback logic for brevity, ideally these strings should also be localized if strictly needed
      // But fallback is rare.
      const contentMappings = {
        film: {
          title: `《${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}》`,
          author: '导演信息',
          description: '这部电影探讨了女性主义相关的重要议题...'
        },
        book: {
          title: `《${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}》`,
          author: '作者信息',
          description: '这本书探讨了女性主义理论和实践...'
        },
        article: {
          title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          author: '文章作者',
          description: '这篇文章分析了当代女性主义的重要议题...'
        },
        video: {
          title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          author: '视频创作者',
          description: '这个视频分享了关于女性主义的深入见解...'
        },
        podcast: {
          title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          author: '播客主持人',
          description: '这期播客深入讨论了女性主义相关话题...'
        },
        paper: {
          title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          author: '研究作者',
          description: '这篇学术论文研究了女性主义理论的重要方面...'
        }
      };

      return contentMappings[contentType as keyof typeof contentMappings] || null;
    };

    loadContent();
  }, [interactions, isAuthenticated, type]);

  const getContentIcon = (contentType: ContentItem['type']) => {
    switch (contentType) {
      case 'book': return '📚';
      case 'article': return '📰';
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'paper': return '📄';
      case 'film': return '🎬';
      default: return '📝';
    }
  };

  const getContentTypeLabel = (contentType: ContentItem['type']) => {
    return getUiString(`types.${contentType}`) || getUiString('types.default');
  };

  const getContentUrl = (item: ContentItem) => {
    const prefix = locale === 'zh-CN' ? '' : `/${locale}`;
    switch (item.type) {
      case 'book': return `${prefix}/books/${item.slug}`;
      case 'article': return `${prefix}/articles/${item.slug}`;
      case 'video': return `${prefix}/videos/${item.slug}`;
      case 'podcast': return `${prefix}/podcasts/${item.slug}`;
      case 'paper': return `${prefix}/papers/${item.slug}`;
      case 'film': return `${prefix}/films/${item.slug}`;
      default: return '#';
    }
  };

  if (!isAuthenticated) {
    const typeLabel = getUiString(`items.${type}`);
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">{type === 'likes' ? '❤️' : '⭐'}</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {getUiString('loginRequired')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {getUiString('loginDesc', { type: typeLabel })}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-pulse">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">{getUiString('loading')}</p>
        </div>
      </div>
    );
  }

  if (contentItems.length === 0) {
    const typeLabel = getUiString(`items.${type}`);
    // Map type to action (like -> like, bookmarks -> bookmark)
    const actionKey = type === 'likes' ? 'like' : 'bookmark';
    const actionLabel = getUiString(`actions.${actionKey}`);

    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">{type === 'likes' ? '💔' : '📭'}</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {getUiString('noContent', { type: typeLabel })}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {getUiString('browseDesc', { action: actionLabel })}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contentItems.map((item) => (
        <a
          key={item.id}
          href={getContentUrl(item)}
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{getContentIcon(item.type)}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                {getContentTypeLabel(item.type)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {getUiString('author')}{item.author}
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {item.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.publishDate).toLocaleDateString(locale)}
              </span>
              <span className="text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:underline">
                {getUiString('viewDetails')}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}