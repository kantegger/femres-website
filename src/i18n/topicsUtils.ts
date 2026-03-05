import topicsMapping from './topicsMapping.json';

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'fr';

// 获取主题的翻译名称
export function getTopicTranslation(topic: string, locale: Locale): string {
  const mapping = topicsMapping[topic as keyof typeof topicsMapping] as any;
  if (mapping) {
    return mapping[locale] || mapping['en'] || topic;
  }
  return topic;
}

// 获取主题的图标
export function getTopicIcon(topic: string): string {
  const mapping = topicsMapping[topic as keyof typeof topicsMapping];
  return mapping?.icon || '📋';
}

// 通过任一语言版本的名称查找主题的完整信息
export function findTopicByName(name: string): {
  key: string;
  zhName: string;
  enName: string;
  icon: string;
} | null {
  // 先尝试作为英文标识符查找
  if (topicsMapping[name as keyof typeof topicsMapping]) {
    const mapping = topicsMapping[name as keyof typeof topicsMapping];
    return {
      key: name,
      zhName: mapping['zh-CN'],
      enName: mapping.en,
      icon: mapping.icon
    };
  }

  // 尝试不区分大小写的 Key 查找
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(topicsMapping)) {
    if (key.toLowerCase() === lowerName) {
      const mapping = topicsMapping[key as keyof typeof topicsMapping];
      return {
        key: key,
        zhName: mapping['zh-CN'],
        enName: mapping.en,
        icon: mapping.icon
      };
    }
  }

  // 如果不是英文标识符，尝试从任意语言名称反向查找
  for (const [enKey, mapping] of Object.entries(topicsMapping)) {
    const m = mapping as any;
    if (m['zh-CN'] === name || m['zh-TW'] === name || m['en'] === name || m['ja'] === name || m['fr'] === name) {
      return {
        key: enKey,
        zhName: mapping['zh-CN'],
        enName: mapping.en,
        icon: mapping.icon
      };
    }
  }

  return null;
}

// 获取所有主题列表（指定语言版本）
export function getAllTopics(locale: Locale): Array<{
  key: string;
  name: string;
  icon: string;
}> {
  return Object.entries(topicsMapping).map(([key, mapping]) => ({
    key,
    name: (mapping as any)[locale] || (mapping as any)['en'] || key,
    icon: (mapping as any).icon
  }));
}

// URL安全编码主题名称
export function encodeTopicForUrl(topicName: string): string {
  return encodeURIComponent(topicName);
}

// 从URL解码主题名称
export function decodeTopicFromUrl(encodedName: string): string {
  return decodeURIComponent(encodedName);
}