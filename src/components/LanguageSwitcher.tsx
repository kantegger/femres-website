import { locales, localeNames, removeLocaleFromPath, getLocalizedPath, type Locale } from '../i18n/index';
import '../styles/editorial-language-switcher.css';

interface Props {
  currentLocale: Locale;
  currentPath: string;
  className?: string;
}

export default function LanguageSwitcher({ currentLocale, currentPath, className = '' }: Props) {
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
        return withLocalePreference(getLocalizedPath(`${contentType}/${contentSlug}`, targetLocale), targetLocale);
      }
    }

    // 默认路径处理
    return withLocalePreference(getLocalizedPath(basePath, targetLocale), targetLocale);
  };

  const withLocalePreference = (href: string, targetLocale: Locale): string => {
    const [pathAndSearch, hash] = href.split('#');
    const separator = pathAndSearch.includes('?') ? '&' : '?';
    const localizedPath = `${pathAndSearch}${separator}locale=${encodeURIComponent(targetLocale)}`;

    return hash ? `${localizedPath}#${hash}` : localizedPath;
  };

  // 获取当前语言显示名称
  const currentLanguageName = localeNames[currentLocale];

  return (
    <details className={`editorial-language${className ? ` ${className}` : ''}`}>
      <summary
        role="button"
        className="editorial-language__trigger"
        aria-haspopup="true"
        aria-label={`Current language: ${currentLanguageName}. Click to change language.`}
      >
        {/* 地球图标 */}
        <svg className="editorial-language__globe" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>

        {/* 当前语言代码（桌面端显示） */}
        <span className="editorial-language__code">
          {currentLocale === 'zh-CN' ? '中' : currentLocale === 'zh-TW' ? '繁' : currentLocale === 'ja' ? '日' : currentLocale === 'fr' ? 'FR' : 'EN'}
        </span>

        {/* 下拉箭头 */}
        <svg
          className="editorial-language__chevron"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="editorial-language__menu">
        {locales.map((locale) => (
          <a
            key={locale}
            href={getLanguageLink(locale)}
            className={`editorial-language__option${locale === currentLocale ? ' is-current' : ''}`}
            aria-current={locale === currentLocale ? 'true' : undefined}
          >
            <span>{localeNames[locale]}</span>
            {locale === currentLocale && (
              <svg className="editorial-language__check" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
    </details>
  );
}
