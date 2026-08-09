import type { Locale, RuntimeTranslationTree } from './types';
import { setTranslations } from './index';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import fr from './locales/fr.json';
import zhTW from './locales/zh-TW.json';

// 翻译数据
const translations: Record<Locale, RuntimeTranslationTree> = {
  'zh-CN': zhCN as RuntimeTranslationTree,
  'en': en as RuntimeTranslationTree,
  'ja': ja as RuntimeTranslationTree,
  'fr': fr as RuntimeTranslationTree,
  'zh-TW': zhTW as RuntimeTranslationTree
};

// 初始化翻译
setTranslations(translations);

export { translations };
export default translations;
