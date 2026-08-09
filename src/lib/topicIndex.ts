import { createT, type Locale } from "../i18n";
import type { TranslationFunction } from "../i18n/types";
import {
  findTopicByName,
  getTopicIcon,
  getTopicSlug,
  getTopicTranslation,
} from "../i18n/topicsUtils";
import { getTopicCountsForLocale } from "./content";
import { nonDefaultDetailLocales } from "./localeDetails";

interface TopicCategoryDefinition {
  topics: string[];
  icon: string;
  mappingKey: string;
}

export interface TopicIndexTopic {
  englishName: string;
  displayName: string;
  count: number;
  icon: string;
}

export interface TopicIndexCategory {
  name: string;
  description: string;
  icon: string;
  totalContent: number;
  topics: TopicIndexTopic[];
}

type TopicIndexPathMode = "root" | "locale";

const topicCategories: Record<string, TopicCategoryDefinition> = {
  theoreticalSchools: {
    topics: [
      "交叉女性主义",
      "马克思主义女性主义",
      "去殖民女性主义",
      "存在主义女性主义",
      "自由主义女性主义",
      "激进女性主义",
      "黑人女性主义",
      "原住民女性主义",
      "跨性别女性主义",
      "生态女性主义",
      "后现代女性主义",
      "无政府女性主义",
      "东亚女性主义",
    ],
    icon: "🧩",
    mappingKey: "theoreticalschools",
  },
  movementIssues: {
    topics: [
      "职场平等",
      "同工同酬",
      "玻璃天花板",
      "生育自主",
      "堕胎权",
      "反性暴力",
      "政治参与",
      "法律平等",
      "经济赋权",
      "教育平等",
      "家庭解放",
      "体育平等",
      "身体自主",
      "数字女性主义",
      "气候正义",
      "社区行动主义",
      "老年女性权利",
      "劳动权利",
      "贫困与正义",
      "社会正义",
      "女性健康",
      "反种族主义政治",
    ],
    icon: "✊",
    mappingKey: "movementissues",
  },
  criticalDomains: {
    topics: [
      "父权制批判",
      "资本主义批判",
      "媒体表征批判",
      "宗教父权批判",
      "男权运动批判",
      "文化批判",
      "反女性主义研究",
      "学术父权批判",
      "语言性别歧视",
      "翻译政治",
      "知识殖民批判",
      "算法偏见",
      "审美标准批判",
      "生命伦理学",
      "消费主义批判",
      "医疗父权批判",
      "政治批判",
      "性政治",
      "年龄歧视与性别",
    ],
    icon: "🔍",
    mappingKey: "criticaldomains",
  },
  historicalContext: {
    topics: [
      "第一波女性主义",
      "第二波女性主义",
      "第三波女性主义",
      "第四波女性主义",
      "MeToo运动",
      "中国女权运动",
      "流行文化女性主义",
      "基督教女性主义",
      "灵性女性主义",
      "女性历史",
    ],
    icon: "📚",
    mappingKey: "historicalcontext",
  },
  literatureCreation: {
    topics: [
      "女性文学",
      "女性写作",
      "女性文学批评",
      "翻译女性主义",
      "女性叙事学",
      "先锋电影",
    ],
    icon: "✍️",
    mappingKey: "literature&creation",
  },
  specialConcepts: {
    topics: [
      "情绪劳动",
      "关怀伦理",
      "女性主义心理学",
      "女性主义艺术",
      "种族与性别",
      "母女关系",
      "女性友谊",
      "酷儿身份",
      "移民身份认同",
      "文化认同",
      "青少年发展",
      "阶级与性别",
      "国际语境",
      "激进幽默",
      "发声与沉默",
    ],
    icon: "💡",
    mappingKey: "specialconcepts",
  },
};

function buildTopicItem(
  topicName: string,
  topicCounts: Record<string, number>,
  locale: Locale,
): TopicIndexTopic {
  const topicInfo = findTopicByName(topicName);
  const englishName = topicInfo?.enName || topicName;

  return {
    englishName,
    displayName: getTopicTranslation(englishName, locale),
    count: topicCounts[englishName] || 0,
    icon: topicInfo?.icon || "📋",
  };
}

export async function buildTopicIndexView(locale: Locale, t: TranslationFunction) {
  const topicCounts = await getTopicCountsForLocale(locale);

  const enrichedCategories = Object.values(topicCategories).map((category) => {
    const topics = category.topics.map((topicName) =>
      buildTopicItem(topicName, topicCounts, locale),
    );

    return {
      name: t(`topicsPage.categories.${category.mappingKey}`),
      description: t(`topicsPage.categoryDescriptions.${category.mappingKey}`),
      icon: category.icon,
      totalContent: topics.reduce((sum, topic) => sum + topic.count, 0),
      topics,
    };
  });

  const popularTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([englishName, count]) => ({
      englishName,
      displayName: getTopicTranslation(englishName, locale),
      count,
      icon: getTopicIcon(englishName),
    }));

  return {
    enrichedCategories,
    popularTopics,
  };
}

export function getTopicIndexStaticPaths() {
  return nonDefaultDetailLocales.map((locale) => ({ params: { locale } }));
}

function getTopicIndexPathPrefix(
  locale: Locale,
  pathMode: TopicIndexPathMode,
): string {
  return pathMode === "locale" ? `/${locale}` : "";
}

export async function buildTopicIndexPageData({
  locale,
  pathMode,
}: {
  locale: Locale;
  pathMode: TopicIndexPathMode;
}) {
  const t = createT(locale);
  const pathPrefix = getTopicIndexPathPrefix(locale, pathMode);
  const view = await buildTopicIndexView(locale, t);

  return {
    t,
    getTopicPath: (topic: string) =>
      `${pathPrefix}/topics/${getTopicSlug(topic)}`,
    contributePath: `${pathPrefix}/contribute`,
    searchPath: `${pathPrefix}/search`,
    formatItemsCount: (count: number) => t("common.itemsCount", { count }),
    formatTopicsCount: (count: number) =>
      t("topicsPage.topicsCount", { count }),
    formatTotalContent: (count: number) =>
      t("topicsPage.totalContent", { count }),
    comingSoonLabel: t("topicsPage.comingSoon"),
    ...view,
  };
}
