import topicsMapping from './topicsMapping.json';
import type { Locale } from './types';

type TopicMappingEntry = Partial<Record<Locale | 'icon', string>>;
const topicMappings = topicsMapping as Record<string, TopicMappingEntry>;

function slugifyTopic(topicName: string): string {
  return topicName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const topicSlugMappings = Object.fromEntries(
  Object.keys(topicMappings).map((topic) => [slugifyTopic(topic), topic]),
);

// 获取主题的翻译名称
export function getTopicTranslation(topic: string, locale: Locale): string {
  const mapping = topicMappings[topic];
  if (mapping) {
    return mapping[locale] || mapping.en || topic;
  }
  return topic;
}

// 获取主题的图标
export function getTopicIcon(topic: string): string {
  const mapping = topicMappings[topic];
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
  if (topicMappings[name]) {
    const mapping = topicMappings[name];
    return {
      key: name,
      zhName: mapping['zh-CN'] || name,
      enName: mapping.en || name,
      icon: mapping.icon || '📋'
    };
  }

  // 尝试不区分大小写的 Key 查找
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(topicMappings)) {
    if (key.toLowerCase() === lowerName) {
      const mapping = topicMappings[key];
      return {
        key: key,
        zhName: mapping['zh-CN'] || key,
        enName: mapping.en || key,
        icon: mapping.icon || '📋'
      };
    }
  }

  // 如果不是英文标识符，尝试从任意语言名称反向查找
  for (const [enKey, mapping] of Object.entries(topicMappings)) {
    if (
      mapping['zh-CN'] === name ||
      mapping['zh-TW'] === name ||
      mapping.en === name ||
      mapping.ja === name ||
      mapping.fr === name
    ) {
      return {
        key: enKey,
        zhName: mapping['zh-CN'] || enKey,
        enName: mapping.en || enKey,
        icon: mapping.icon || '📋'
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
  return Object.entries(topicMappings).map(([key, mapping]) => ({
    key,
    name: mapping[locale] || mapping.en || key,
    icon: mapping.icon || '📋'
  }));
}

// 获取主题的稳定 URL 片段
export function getTopicSlug(topicName: string): string {
  return slugifyTopic(topicName) || encodeURIComponent(topicName);
}

// 从 URL 片段解析 canonical 主题名，兼容旧的 encodeURIComponent 链接
export function resolveTopicFromUrl(topicName: string): string {
  const decodedTopic = decodeURIComponent(topicName);
  const directMatch = findTopicByName(decodedTopic);

  if (directMatch) {
    return directMatch.key;
  }

  return (
    topicSlugMappings[decodedTopic] ||
    topicSlugMappings[slugifyTopic(decodedTopic)] ||
    decodedTopic
  );
}

// URL安全编码主题名称
export function encodeTopicForUrl(topicName: string): string {
  return getTopicSlug(topicName);
}

// 从URL解码主题名称
export function decodeTopicFromUrl(encodedName: string): string {
  return resolveTopicFromUrl(encodedName);
}
