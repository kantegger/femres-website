import type { Locale } from "./types";

type RegionLabels = Record<Locale, string>;

const regions = {
  "Algeria / France / Belgium": { "zh-CN": "阿尔及利亚 / 法国 / 比利时", "zh-TW": "阿爾及利亞 / 法國 / 比利時", en: "Algeria / France / Belgium", ja: "アルジェリア / フランス / ベルギー", fr: "Algérie / France / Belgique" },
  Australia: { "zh-CN": "澳大利亚", "zh-TW": "澳大利亞", en: "Australia", ja: "オーストラリア", fr: "Australie" },
  "Belgium / France": { "zh-CN": "比利时 / 法国", "zh-TW": "比利時 / 法國", en: "Belgium / France", ja: "ベルギー / フランス", fr: "Belgique / France" },
  Bangladesh: { "zh-CN": "孟加拉国", "zh-TW": "孟加拉國", en: "Bangladesh", ja: "バングラデシュ", fr: "Bangladesh" },
  Brazil: { "zh-CN": "巴西", "zh-TW": "巴西", en: "Brazil", ja: "ブラジル", fr: "Brésil" },
  "Brazil / Germany": { "zh-CN": "巴西 / 德国", "zh-TW": "巴西 / 德國", en: "Brazil / Germany", ja: "ブラジル / ドイツ", fr: "Brésil / Allemagne" },
  "Chad / France / Germany / Belgium": { "zh-CN": "乍得 / 法国 / 德国 / 比利时", "zh-TW": "查德 / 法國 / 德國 / 比利時", en: "Chad / France / Germany / Belgium", ja: "チャド / フランス / ドイツ / ベルギー", fr: "Tchad / France / Allemagne / Belgique" },
  Chile: { "zh-CN": "智利", "zh-TW": "智利", en: "Chile", ja: "チリ", fr: "Chili" },
  Canada: { "zh-CN": "加拿大", "zh-TW": "加拿大", en: "Canada", ja: "カナダ", fr: "Canada" },
  "China / France": { "zh-CN": "中国 / 法国", "zh-TW": "中國 / 法國", en: "China / France", ja: "中国 / フランス", fr: "Chine / France" },
  Czechoslovakia: { "zh-CN": "捷克斯洛伐克", "zh-TW": "捷克斯洛伐克", en: "Czechoslovakia", ja: "チェコスロバキア", fr: "Tchécoslovaquie" },
  France: { "zh-CN": "法国", "zh-TW": "法國", en: "France", ja: "フランス", fr: "France" },
  "France / Morocco / Belgium": { "zh-CN": "法国 / 摩洛哥 / 比利时", "zh-TW": "法國 / 摩洛哥 / 比利時", en: "France / Morocco / Belgium", ja: "フランス / モロッコ / ベルギー", fr: "France / Maroc / Belgique" },
  "France / Tunisia / Germany / Saudi Arabia": { "zh-CN": "法国 / 突尼斯 / 德国 / 沙特阿拉伯", "zh-TW": "法國 / 突尼西亞 / 德國 / 沙烏地阿拉伯", en: "France / Tunisia / Germany / Saudi Arabia", ja: "フランス / チュニジア / ドイツ / サウジアラビア", fr: "France / Tunisie / Allemagne / Arabie saoudite" },
  "Germany/USA": { "zh-CN": "德国 / 美国", "zh-TW": "德國 / 美國", en: "Germany / USA", ja: "ドイツ / アメリカ", fr: "Allemagne / États-Unis" },
  India: { "zh-CN": "印度", "zh-TW": "印度", en: "India", ja: "インド", fr: "Inde" },
  Ireland: { "zh-CN": "爱尔兰", "zh-TW": "愛爾蘭", en: "Ireland", ja: "アイルランド", fr: "Irlande" },
  Japan: { "zh-CN": "日本", "zh-TW": "日本", en: "Japan", ja: "日本", fr: "Japon" },
  "Japan / France / Philippines": { "zh-CN": "日本 / 法国 / 菲律宾", "zh-TW": "日本 / 法國 / 菲律賓", en: "Japan / France / Philippines", ja: "日本 / フランス / フィリピン", fr: "Japon / France / Philippines" },
  Mexico: { "zh-CN": "墨西哥", "zh-TW": "墨西哥", en: "Mexico", ja: "メキシコ", fr: "Mexique" },
  "Mexico / Germany / Brazil / Qatar": { "zh-CN": "墨西哥 / 德国 / 巴西 / 卡塔尔", "zh-TW": "墨西哥 / 德國 / 巴西 / 卡達", en: "Mexico / Germany / Brazil / Qatar", ja: "メキシコ / ドイツ / ブラジル / カタール", fr: "Mexique / Allemagne / Brésil / Qatar" },
  Kenya: { "zh-CN": "肯尼亚", "zh-TW": "肯亞", en: "Kenya", ja: "ケニア", fr: "Kenya" },
  Nepal: { "zh-CN": "尼泊尔", "zh-TW": "尼泊爾", en: "Nepal", ja: "ネパール", fr: "Népal" },
  "New Zealand": { "zh-CN": "新西兰", "zh-TW": "紐西蘭", en: "New Zealand", ja: "ニュージーランド", fr: "Nouvelle-Zélande" },
  "Palestine / France / Jordan / Lebanon": { "zh-CN": "巴勒斯坦 / 法国 / 约旦 / 黎巴嫩", "zh-TW": "巴勒斯坦 / 法國 / 約旦 / 黎巴嫩", en: "Palestine / France / Jordan / Lebanon", ja: "パレスチナ / フランス / ヨルダン / レバノン", fr: "Palestine / France / Jordanie / Liban" },
  Pakistan: { "zh-CN": "巴基斯坦", "zh-TW": "巴基斯坦", en: "Pakistan", ja: "パキスタン", fr: "Pakistan" },
  "Peru / Spain": { "zh-CN": "秘鲁 / 西班牙", "zh-TW": "秘魯 / 西班牙", en: "Peru / Spain", ja: "ペルー / スペイン", fr: "Pérou / Espagne" },
  Romania: { "zh-CN": "罗马尼亚", "zh-TW": "羅馬尼亞", en: "Romania", ja: "ルーマニア", fr: "Roumanie" },
  "Saudi Arabia": { "zh-CN": "沙特阿拉伯", "zh-TW": "沙烏地阿拉伯", en: "Saudi Arabia", ja: "サウジアラビア", fr: "Arabie saoudite" },
  Senegal: { "zh-CN": "塞内加尔", "zh-TW": "塞內加爾", en: "Senegal", ja: "セネガル", fr: "Sénégal" },
  "South Korea": { "zh-CN": "韩国", "zh-TW": "南韓", en: "South Korea", ja: "韓国", fr: "Corée du Sud" },
  "Sri Lanka": { "zh-CN": "斯里兰卡", "zh-TW": "斯里蘭卡", en: "Sri Lanka", ja: "スリランカ", fr: "Sri Lanka" },
  Taiwan: { "zh-CN": "台湾", "zh-TW": "台灣", en: "Taiwan", ja: "台湾", fr: "Taïwan" },
  "Tunisia / France / Sweden / Norway / Lebanon / Qatar / Switzerland": { "zh-CN": "突尼斯 / 法国 / 瑞典 / 挪威 / 黎巴嫩 / 卡塔尔 / 瑞士", "zh-TW": "突尼西亞 / 法國 / 瑞典 / 挪威 / 黎巴嫩 / 卡達 / 瑞士", en: "Tunisia / France / Sweden / Norway / Lebanon / Qatar / Switzerland", ja: "チュニジア / フランス / スウェーデン / ノルウェー / レバノン / カタール / スイス", fr: "Tunisie / France / Suède / Norvège / Liban / Qatar / Suisse" },
  "Turkey / France / Germany": { "zh-CN": "土耳其 / 法国 / 德国", "zh-TW": "土耳其 / 法國 / 德國", en: "Turkey / France / Germany", ja: "トルコ / フランス / ドイツ", fr: "Turquie / France / Allemagne" },
  UK: { "zh-CN": "英国", "zh-TW": "英國", en: "UK", ja: "イギリス", fr: "Royaume-Uni" },
  "UK/Germany": { "zh-CN": "英国 / 德国", "zh-TW": "英國 / 德國", en: "UK / Germany", ja: "イギリス / ドイツ", fr: "Royaume-Uni / Allemagne" },
  "UK/USA": { "zh-CN": "英国 / 美国", "zh-TW": "英國 / 美國", en: "UK / USA", ja: "イギリス / アメリカ", fr: "Royaume-Uni / États-Unis" },
  USA: { "zh-CN": "美国", "zh-TW": "美國", en: "USA", ja: "アメリカ", fr: "États-Unis" },
  "USA/UK": { "zh-CN": "美国 / 英国", "zh-TW": "美國 / 英國", en: "USA / UK", ja: "アメリカ / イギリス", fr: "États-Unis / Royaume-Uni" },
  "United States, Philippines": { "zh-CN": "美国、菲律宾", "zh-TW": "美國、菲律賓", en: "United States, Philippines", ja: "アメリカ、フィリピン", fr: "États-Unis, Philippines" },
  Zambia: { "zh-CN": "赞比亚", "zh-TW": "尚比亞", en: "Zambia", ja: "ザンビア", fr: "Zambie" },
} as const satisfies Record<string, RegionLabels>;

export type CanonicalRegion = keyof typeof regions;

const normalizeRegion = (value: string) => value
  .trim()
  .replace(/／/g, "/")
  .replace(/\s*\/\s*/g, "/")
  .replace(/，/g, ",")
  .replace(/\s*,\s*/g, ",")
  .toLocaleLowerCase();

const canonicalByLabel = new Map<string, CanonicalRegion>();
for (const [canonical, labels] of Object.entries(regions) as [CanonicalRegion, RegionLabels][]) {
  canonicalByLabel.set(normalizeRegion(canonical), canonical);
  Object.values(labels).forEach((label) => canonicalByLabel.set(normalizeRegion(label), canonical));
}

export function getCanonicalRegion(region: string): string {
  return canonicalByLabel.get(normalizeRegion(region)) ?? region.trim();
}

export function hasRegionTranslation(region: string): boolean {
  return canonicalByLabel.has(normalizeRegion(region));
}

export function getRegionTranslation(region: string, locale: Locale): string {
  const canonical = getCanonicalRegion(region);
  return regions[canonical as CanonicalRegion]?.[locale] ?? region;
}
