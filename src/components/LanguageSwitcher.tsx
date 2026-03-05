import { useState, useRef, useEffect } from 'react';
import { locales, localeNames, getLocaleFromUrl, removeLocaleFromPath, getLocalizedPath, type Locale } from '../i18n/index';

interface Props {
  currentLocale: Locale;
  currentPath: string;
}

export default function LanguageSwitcher({ currentLocale, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 关闭下拉菜单的处理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // 生成语言切换链接
  const getLanguageLink = (targetLocale: Locale): string => {
    // 从当前路径移除语言前缀，得到基础路径
    const basePath = removeLocaleFromPath(currentPath);

    // 特殊处理内容详情页的slug映射
    const contentTypes = ['books', 'films', 'articles', 'videos', 'podcasts', 'papers'];

    for (const contentType of contentTypes) {
      if (basePath.startsWith(`/${contentType}/`)) {
        const contentSlug = basePath.replace(`/${contentType}/`, '');

        // 对于内容详情页，中英文页面使用相同的URL slug
        // 因为英文文件 (xxx-en.md) 生成的路由是 xxx，与中文文件 (xxx.md) 相同
        // 所以语言切换时URL保持不变，只是切换到不同的语言版本
        return getLocalizedPath(`${contentType}/${contentSlug}`, targetLocale);
      }
    }

    // 默认路径处理
    return getLocalizedPath(basePath, targetLocale);
  };

  // 获取当前语言显示名称
  const currentLanguageName = localeNames[currentLocale];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 语言切换按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current language: ${currentLanguageName}. Click to change language.`}
      >
        {/* 地球图标 */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>

        {/* 当前语言代码（桌面端显示） */}
        <span className="hidden sm:inline-block text-sm font-medium">
          {currentLocale === 'zh-CN' ? '中' : currentLocale === 'zh-TW' ? '繁' : currentLocale === 'ja' ? '日' : currentLocale === 'fr' ? 'FR' : 'EN'}
        </span>

        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {locales.map((locale) => (
            <a
              key={locale}
              href={getLanguageLink(locale)}
              className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${locale === currentLocale
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}