import type {
  Locale,
  RuntimeTranslationTree,
  TranslationKeys,
  TranslationParam,
  TranslationValue
} from './types';

export type { Locale, TranslationKeys };

// 支持的语言配置
export const defaultLocale: Locale = 'zh-CN';
export const locales: Locale[] = ['zh-CN', 'en', 'ja', 'fr', 'zh-TW'];

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en': 'English',
  'ja': '日本語',
  'fr': 'Français',
  'zh-TW': '繁體中文'
};

// 从URL获取当前语言
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;

  // 检查路径是否以 /en 开头
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }

  // 检查路径是否以 /ja 开头
  if (pathname.startsWith('/ja/') || pathname === '/ja') {
    return 'ja';
  }

  // 检查路径是否以 /fr 开头
  if (pathname.startsWith('/fr/') || pathname === '/fr') {
    return 'fr';
  }

  // 检查路径是否以 /zh-TW 开头
  if (pathname.startsWith('/zh-TW/') || pathname === '/zh-TW') {
    return 'zh-TW';
  }

  // 默认返回中文
  return 'zh-CN';
}

// 生成本地化路径
// 生成本地化路径
export function getLocalizedPath(path: string, locale: Locale): string {
  // 先移除已有的语言前缀（如果有）
  // 注意：如果path是相对路径且不包含语言前缀，removeLocaleFromPath会保持原样
  let cleanPath = removeLocaleFromPath(path);

  // 移除开头的斜杠，如果存在的话
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  if (locale === 'zh-CN') {
    // 中文是默认语言，不需要前缀
    return `/${cleanPath}`;
  } else {
    // 其他语言需要语言前缀
    return `/${locale}/${cleanPath}`;
  }
}

// 从本地化路径中移除语言前缀
export function removeLocaleFromPath(path: string): string {
  for (const locale of locales) {
    if (locale !== defaultLocale && path.startsWith(`/${locale}/`)) {
      return path.slice(`/${locale}`.length);
    }
    if (locale !== defaultLocale && path === `/${locale}`) {
      return '/';
    }
  }
  return path;
}

// 翻译函数类型和实现会在加载翻译文件后定义
let translations: Partial<Record<Locale, RuntimeTranslationTree>> = {};

// 设置翻译数据
export function setTranslations(translationData: Record<Locale, RuntimeTranslationTree>) {
  translations = translationData;
}

const isTranslationTree = (value: TranslationValue | undefined): value is RuntimeTranslationTree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// 获取嵌套对象的值
function getNestedValue(
  obj: RuntimeTranslationTree | undefined,
  path: string
): TranslationValue | undefined {
  if (!obj) {
    return undefined;
  }

  let current: TranslationValue | undefined = obj;

  for (const key of path.split('.')) {
    if (!isTranslationTree(current) || current[key] === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

// 翻译函数
export function t(locale: Locale, key: string, params?: Record<string, TranslationParam>): string {
  const translation = translations[locale];
  if (!translation) {
    console.warn(`Translation not found for locale: ${locale}`);
    return key;
  }

  let value = getNestedValue(translation, key);

  if (value === null || value === undefined) {
    console.warn(`Translation key not found: ${key} for locale: ${locale}`);
    // 尝试使用默认语言
    if (locale !== defaultLocale) {
      value = getNestedValue(translations[defaultLocale], key);
    }
    if (value === null || value === undefined) {
      return key;
    }
  }

  // 参数替换
  if (params && typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      const replacement = params[paramKey];
      return replacement === undefined ? match : String(replacement);
    });
  }

  return value as string;
}

export function getTranslationValue(
  locale: Locale,
  key: string,
): TranslationValue | undefined {
  const value = getNestedValue(translations[locale], key);
  if (value !== null && value !== undefined) return value;
  if (locale === defaultLocale) return undefined;

  const fallbackValue = getNestedValue(translations[defaultLocale], key);
  return fallbackValue ?? undefined;
}

// 创建特定语言的翻译函数
export function createT(locale: Locale) {
  return (key: string, params?: Record<string, TranslationParam>) => t(locale, key, params);
}

// 格式化日期
export function formatDate(date: Date, locale: Locale): string {
  let formatLocale = 'zh-CN';
  if (locale === 'en') formatLocale = 'en-US';
  if (locale === 'ja') formatLocale = 'ja-JP';
  if (locale === 'fr') formatLocale = 'fr-FR';
  if (locale === 'zh-TW') formatLocale = 'zh-TW';

  return new Intl.DateTimeFormat(formatLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// 格式化相对时间
export function formatRelativeTime(date: Date, locale: Locale): string {
  let formatLocale = 'zh-CN';
  if (locale === 'en') formatLocale = 'en-US';
  if (locale === 'ja') formatLocale = 'ja-JP';
  if (locale === 'fr') formatLocale = 'fr-FR';
  if (locale === 'zh-TW') formatLocale = 'zh-TW';

  const rtf = new Intl.RelativeTimeFormat(formatLocale, { numeric: 'auto' });

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(Math.ceil(diffDays / 7), 'week');
  } else if (Math.abs(diffDays) < 365) {
    return rtf.format(Math.ceil(diffDays / 30), 'month');
  } else {
    return rtf.format(Math.ceil(diffDays / 365), 'year');
  }
}
