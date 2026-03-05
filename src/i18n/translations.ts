import type { TranslationKeys, Locale } from './types';
import { setTranslations } from './index';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import fr from './locales/fr.json';
import zhTW from './locales/zh-TW.json';

// 翻译数据
const translations: Record<Locale, TranslationKeys> = {
  'zh-CN': zhCN as TranslationKeys,
  'en': en as TranslationKeys,
  'ja': ja as TranslationKeys,
  'fr': fr as TranslationKeys,
  'zh-TW': zhTW as TranslationKeys
};

// 初始化翻译
setTranslations(translations);

export { translations };
export default translations;