import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import type { UserContentListStrings } from '../types/profile';
import { EDITORIAL_CONTENT_TYPE_ORDER } from '../lib/contentTypeOrder';
import '../styles/editorial-account.css';

type ContentType = (typeof EDITORIAL_CONTENT_TYPE_ORDER)[number];
type ViewMode = 'detail' | 'visual' | 'grouped';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  description: string;
  type: ContentType;
  slug: string;
  coverImage?: string;
  publishDate: string;
}

interface BatchContentItem {
  id: string;
  title: string;
  author?: string;
  description?: string;
  type: ContentType;
  slug: string;
  coverImage?: string;
  publishDate?: string;
}

interface UserContentListProps {
  type: 'likes' | 'bookmarks';
  locale?: string;
  uiStrings?: UserContentListStrings;
}

const PAGE_SIZE = 12;
const GROUP_PAGE_SIZE = 10;
const GROUP_ORDER = EDITORIAL_CONTENT_TYPE_ORDER;

function getContentTypeFromId(id: string): ContentType {
  const rawType = id.slice(0, id.indexOf('-'));
  return GROUP_ORDER.includes(rawType as ContentType) ? rawType as ContentType : 'article';
}

function humanizeSlug(slug: string) {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function fallbackContent(id: string): ContentItem {
  const [, ...slugParts] = id.split('-');
  const type = getContentTypeFromId(id);
  const slug = slugParts.join('-') || 'unknown';

  return {
    id,
    title: humanizeSlug(slug),
    author: '',
    description: '',
    type,
    slug,
    publishDate: new Date().toISOString(),
  };
}

function Pagination({
  currentPage,
  totalPages,
  label,
  previousLabel,
  nextLabel,
  onChange,
  compact = false,
}: {
  currentPage: number;
  totalPages: number;
  label: string;
  previousLabel: string;
  nextLabel: string;
  onChange: (page: number) => void;
  compact?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`reader-pagination${compact ? ' reader-pagination--compact' : ''}`} aria-label={label}>
      <button
        type="button"
        aria-label={previousLabel}
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        ←
      </button>
      <span aria-live="polite">{currentPage} / {totalPages}</span>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        →
      </button>
    </nav>
  );
}

function VisualMedia({ item, label }: { item: ContentItem; label: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`reader-visual-item__media reader-visual-item__media--${item.type}`}>
      {item.coverImage && !imageFailed
        ? <img src={item.coverImage} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        : <span>{label}</span>}
    </div>
  );
}

export default function UserContentList({ type, locale = 'zh-CN', uiStrings }: UserContentListProps) {
  const { interactions, isAuthenticated } = useAuthStore();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [viewModeReady, setViewModeReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupPages, setGroupPages] = useState<Partial<Record<ContentType, number>>>({});
  const contentCache = useRef(new Map<string, ContentItem>());
  const contentIds = type === 'likes' ? interactions.likes : interactions.bookmarks;
  const contentKey = contentIds.join('\u001f');
  const storageKey = `femres-reader-${type}-view`;

  const contentIdsByType = useMemo(() => {
    const grouped: Record<ContentType, string[]> = {
      book: [],
      film: [],
      article: [],
      paper: [],
      video: [],
      podcast: [],
    };
    contentIds.forEach((id) => grouped[getContentTypeFromId(id)].push(id));
    return grouped;
  }, [contentKey]);

  const totalPages = Math.max(1, Math.ceil(contentIds.length / PAGE_SIZE));
  const selectedIds = useMemo(() => {
    if (viewMode === 'grouped') {
      return GROUP_ORDER.flatMap((contentType) => {
        const page = groupPages[contentType] || 1;
        const start = (page - 1) * GROUP_PAGE_SIZE;
        return contentIdsByType[contentType].slice(start, start + GROUP_PAGE_SIZE);
      });
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    return contentIds.slice(start, start + PAGE_SIZE);
  }, [contentIds, contentIdsByType, currentPage, groupPages, viewMode]);
  const selectedIdsKey = selectedIds.join('\u001f');

  const getUiString = (key: string, params?: Record<string, string>) => {
    if (!uiStrings) return '';
    const keys = key.split('.');
    let value: unknown = uiStrings;

    for (const part of keys) {
      if (typeof value !== 'object' || value === null || !(part in value)) {
        value = undefined;
        break;
      }
      value = (value as Record<string, unknown>)[part];
    }

    if (typeof value !== 'string') return key;
    return params ? value.replace(/\{(\w+)\}/g, (_, name) => params[name] || '') : value;
  };

  const loadBatch = async (ids: string[]) => {
    const response = await fetch('/api/content/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, locale }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { items?: BatchContentItem[] };
    const itemById = new Map((data.items || []).map((item) => [item.id, item]));

    return ids.map((id): ContentItem => {
      const item = itemById.get(id);
      if (!item) return fallbackContent(id);
      return {
        id,
        title: item.title,
        author: item.author || '',
        description: item.description || '',
        type: item.type,
        slug: item.slug,
        coverImage: item.coverImage,
        publishDate: item.publishDate || new Date().toISOString(),
      };
    });
  };

  useEffect(() => {
    const savedMode = window.localStorage.getItem(storageKey);
    if (savedMode === 'detail' || savedMode === 'visual' || savedMode === 'grouped') {
      setViewMode(savedMode);
    } else {
      setViewMode('detail');
    }
    setViewModeReady(true);
  }, [storageKey]);

  useEffect(() => {
    contentCache.current.clear();
    setCurrentPage(1);
    setGroupPages({});
  }, [contentKey, locale, type]);

  useEffect(() => {
    let cancelled = false;

    const loadVisibleContent = async () => {
      setContentItems([]);
      if (!viewModeReady) return;
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      if (selectedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const missingIds = selectedIds.filter((id) => !contentCache.current.has(id));
        if (missingIds.length) {
          const items = await loadBatch(missingIds);
          items.forEach((item) => contentCache.current.set(item.id, item));
        }
        if (!cancelled) {
          setContentItems(selectedIds.map((id) => contentCache.current.get(id) || fallbackContent(id)));
        }
      } catch (error) {
        console.warn('Failed to load profile content batch:', error);
        if (!cancelled) setContentItems(selectedIds.map((id) => contentCache.current.get(id) || fallbackContent(id)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadVisibleContent();
    return () => { cancelled = true; };
  }, [isAuthenticated, locale, selectedIdsKey, type, viewModeReady]);

  const groupedItems = useMemo(() => {
    const itemById = new Map(contentItems.map((item) => [item.id, item]));
    return GROUP_ORDER.flatMap((contentType) => {
      const allIds = contentIdsByType[contentType];
      if (!allIds.length) return [];

      const page = groupPages[contentType] || 1;
      const pageCount = Math.ceil(allIds.length / GROUP_PAGE_SIZE);
      const start = (page - 1) * GROUP_PAGE_SIZE;
      const items = allIds
        .slice(start, start + GROUP_PAGE_SIZE)
        .map((id) => itemById.get(id) || fallbackContent(id));

      return [{ type: contentType, items, total: allIds.length, page, pageCount }];
    });
  }, [contentIdsByType, contentItems, groupPages]);

  const getContentTypeLabel = (contentType: ContentType, plural = false) => (
    getUiString(`types.${contentType}${plural ? '_plural' : ''}`) || getUiString('types.default')
  );

  const getContentUrl = (item: ContentItem) => {
    const prefix = locale === 'zh-CN' ? '' : `/${locale}`;
    const paths: Record<ContentType, string> = {
      book: 'books', article: 'articles', video: 'videos', podcast: 'podcasts', paper: 'papers', film: 'films',
    };
    return `${prefix}/${paths[item.type]}/${item.slug}`;
  };

  const chooseView = (mode: ViewMode) => {
    setViewMode(mode);
    window.localStorage.setItem(storageKey, mode);
  };

  const chooseGroupPage = (contentType: ContentType, page: number) => {
    setGroupPages((current) => ({ ...current, [contentType]: page }));
  };

  if (!isAuthenticated) {
    const typeLabel = getUiString(`items.${type}`);
    return (
      <div className="reader-content-list reader-content-list__state">
        <div><h2>{getUiString('loginRequired')}</h2><p>{getUiString('loginDesc', { type: typeLabel })}</p></div>
      </div>
    );
  }

  if (loading) {
    return <div className="reader-content-list reader-content-list__state" aria-live="polite"><div><h2>{getUiString('loading')}</h2></div></div>;
  }

  if (contentItems.length === 0) {
    const typeLabel = getUiString(`items.${type}`);
    const actionLabel = getUiString(`actions.${type === 'likes' ? 'like' : 'bookmark'}`);
    return (
      <div className="reader-content-list reader-content-list__state">
        <div><h2>{getUiString('noContent', { type: typeLabel })}</h2><p>{getUiString('browseDesc', { action: actionLabel })}</p></div>
      </div>
    );
  }

  const rangeStart = viewMode === 'grouped' ? 1 : ((currentPage - 1) * PAGE_SIZE) + 1;
  const rangeEnd = viewMode === 'grouped' ? contentItems.length : rangeStart + contentItems.length - 1;
  const shownValue = viewMode === 'grouped'
    ? String(contentItems.length)
    : rangeStart === rangeEnd ? String(rangeStart) : `${rangeStart}–${rangeEnd}`;

  return (
    <div className="reader-content-list">
      <div className="reader-content-toolbar">
        <div className="reader-view-switcher" role="group" aria-label={getUiString('viewModeLabel')}>
          {([
            ['detail', getUiString('detailView')],
            ['visual', getUiString('visualView')],
            ['grouped', getUiString('groupedView')],
          ] as [ViewMode, string][]).map(([mode, label]) => (
            <button key={mode} type="button" aria-pressed={viewMode === mode} onClick={() => chooseView(mode)}>{label}</button>
          ))}
        </div>
        <p>{getUiString('showingCount', { shown: shownValue, total: String(contentIds.length) })}</p>
      </div>

      {viewMode === 'detail' && (
        <div className="reader-content-list__items">
          {contentItems.map((item, index) => (
            <a key={item.id} href={getContentUrl(item)} className="reader-content-item">
              <span className="reader-content-item__number">{String(((currentPage - 1) * PAGE_SIZE) + index + 1).padStart(2, '0')}</span>
              <div>
                <span className="reader-content-item__type">{getContentTypeLabel(item.type)}</span>
                <h3>{item.title}</h3>
                {item.author && <p>{getUiString('author')}{item.author}</p>}
                {item.description && <p>{item.description}</p>}
              </div>
              <div className="reader-content-item__meta">
                <span>{new Date(item.publishDate).toLocaleDateString(locale)}</span>
                <span className="reader-content-item__action">{getUiString('viewDetails')}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {viewMode === 'visual' && (
        <div className="reader-content-visual">
          {contentItems.map((item) => (
            <a key={item.id} href={getContentUrl(item)} className="reader-visual-item">
              <VisualMedia item={item} label={getContentTypeLabel(item.type)} />
              <span className="reader-content-item__type">{getContentTypeLabel(item.type)}</span>
              <h3>{item.title}</h3>
              {item.author && <p>{item.author}</p>}
            </a>
          ))}
        </div>
      )}

      {viewMode === 'grouped' && (
        <div className="reader-content-groups">
          {groupedItems.map((group) => (
            <section key={group.type}>
              <header>
                <div className="reader-content-groups__title">
                  <h2>{getContentTypeLabel(group.type, true)}</h2>
                  <span className="reader-content-groups__count">{group.total}</span>
                </div>
                <Pagination
                  compact
                  currentPage={group.page}
                  totalPages={group.pageCount}
                  label={getUiString('groupPages', { type: getContentTypeLabel(group.type, true) })}
                  previousLabel={getUiString('previousPage')}
                  nextLabel={getUiString('nextPage')}
                  onChange={(page) => chooseGroupPage(group.type, page)}
                />
              </header>
              <ol style={{ counterReset: `reader-group ${(group.page - 1) * GROUP_PAGE_SIZE}` }}>
                {group.items.map((item) => <li key={item.id}><a href={getContentUrl(item)}>{item.title}</a></li>)}
              </ol>
            </section>
          ))}
        </div>
      )}

      {viewMode !== 'grouped' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          label={getUiString('collectionPages')}
          previousLabel={getUiString('previousPage')}
          nextLabel={getUiString('nextPage')}
          onChange={setCurrentPage}
        />
      )}
    </div>
  );
}
