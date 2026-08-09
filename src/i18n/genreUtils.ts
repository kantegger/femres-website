import type { Locale } from "./types";

type TranslationMap = Record<Locale, string>;
type GenreDefinition = TranslationMap & { aliases?: readonly string[] };

const genre = (
  zhCN: string,
  zhTW: string,
  en: string,
  ja: string,
  fr: string,
  aliases: readonly string[] = [],
): GenreDefinition => ({ "zh-CN": zhCN, "zh-TW": zhTW, en, ja, fr, aliases });

const genreTranslations = {
  Action: genre("动作", "動作", "Action", "アクション", "Action"),
  Adventure: genre("冒险", "冒險", "Adventure", "アドベンチャー", "Aventure"),
  Animation: genre("动画", "動畫", "Animation", "アニメーション", "Animation"),
  "Art House": genre("艺术电影", "藝術電影", "Art House", "アートハウス", "Cinéma d’auteur", ["Cinéma d'auteur"]),
  "Avant-garde": genre("先锋派", "先鋒派", "Avant-garde", "前衛映画", "Avant-garde", ["先锋实验", "先鋒實驗", "アヴァンギャルド"]),
  Biography: genre("传记", "傳記", "Biography", "伝記", "Biographie", ["Biographical", "Biographique"]),
  "Black Comedy": genre("黑色喜剧", "黑色喜劇", "Black Comedy", "ブラックコメディ", "Comédie noire", ["Dark Comedy", "ブラック・コメディ"]),
  "Body Horror": genre("身体恐怖", "身體恐怖", "Body Horror", "ボディ・ホラー", "Horreur corporelle"),
  Comedy: genre("喜剧", "喜劇", "Comedy", "コメディ", "Comédie"),
  "Coming-of-Age": genre("成长", "成長", "Coming-of-Age", "青春", "Récit initiatique", ["Coming-of-age"]),
  Crime: genre("犯罪", "犯罪", "Crime", "クライム", "Policier"),
  "Cultural Identity": genre("文化认同", "文化認同", "Cultural Identity", "文化的アイデンティティ", "Identité culturelle", ["文化的なアイデンティティ"]),
  Documentary: genre("纪录片", "紀錄片", "Documentary", "ドキュメンタリー", "Documentaire"),
  Drama: genre("剧情", "劇情", "Drama", "ドラマ", "Drame"),
  Experimental: genre("实验", "實驗", "Experimental", "実験", "Expérimental"),
  Family: genre("家庭", "家庭", "Family", "ファミリー", "Famille", ["Familial"]),
  Fantasy: genre("奇幻", "奇幻", "Fantasy", "ファンタジー", "Fantastique", ["Fantaisie"]),
  Feminist: genre("女性主义", "女性主義", "Feminist", "フェミニスト", "Féministe"),
  Historical: genre("历史", "歷史", "Historical", "歴史", "Historique"),
  History: genre("历史", "歷史", "History", "歴史", "Histoire"),
  Horror: genre("恐怖", "恐怖", "Horror", "ホラー", "Horreur"),
  Independent: genre("独立电影", "獨立電影", "Independent", "インディペンデント", "Indépendant"),
  Journalism: genre("新闻", "新聞", "Journalism", "ジャーナリズム", "Journalisme"),
  "LGBTQ+": genre("LGBTQ+", "LGBTQ+", "LGBTQ+", "LGBTQ+", "LGBTQ+"),
  Music: genre("音乐", "音樂", "Music", "音楽", "Musique"),
  Musical: genre("音乐剧", "音樂劇", "Musical", "ミュージカル", "Comédie musicale"),
  Mystery: genre("悬疑", "懸疑", "Mystery", "ミステリー", "Mystère"),
  Period: genre("年代", "年代", "Period", "時代劇", "Époque"),
  "Period Drama": genre("年代剧", "年代劇", "Period Drama", "時代劇", "Film d’époque", ["Film d'époque"]),
  Psychological: genre("心理", "心理", "Psychological", "心理", "Psychologique"),
  Romance: genre("爱情", "愛情", "Romance", "ロマンス", "Romance"),
  "Road Movie": genre("公路电影", "公路電影", "Road Movie", "ロードムービー", "Road Movie"),
  "Science Fiction": genre("科幻", "科幻", "Science Fiction", "SF", "Science-fiction", ["Sci-Fi"]),
  Short: genre("短片", "短片", "Short", "短編", "Court métrage"),
  "Social Issues": genre("社会议题", "社會議題", "Social Issues", "社会問題", "Questions sociales", ["社会问题", "社會問題"]),
  "Social Realism": genre("社会现实", "社會現實", "Social Realism", "社会派リアリズム", "Réalisme social", ["社会写実主義", "ソーシャル・リアリズム"]),
  Sports: genre("体育", "體育", "Sports", "スポーツ", "Sport", ["Sport", "运动", "運動"]),
  Superhero: genre("超级英雄", "超級英雄", "Superhero", "スーパーヒーロー", "Super-héros"),
  Surrealism: genre("超现实主义", "超現實主義", "Surrealism", "シュルレアリスム", "Surréalisme"),
  Thriller: genre("惊悚", "驚悚", "Thriller", "スリラー", "Thriller"),
  War: genre("战争", "戰爭", "War", "戦争", "Guerre"),
  Western: genre("西部", "西部", "Western", "西部劇", "Western"),
} as const satisfies Record<string, GenreDefinition>;

type CanonicalGenre = keyof typeof genreTranslations;

const normalizeGenre = (value: string) => value.trim().toLocaleLowerCase();
const canonicalGenreByLabel = new Map<string, CanonicalGenre>();

for (const [canonical, definition] of Object.entries(genreTranslations) as [CanonicalGenre, GenreDefinition][]) {
  canonicalGenreByLabel.set(normalizeGenre(canonical), canonical);
  Object.values(definition)
    .filter((value): value is string => typeof value === "string")
    .forEach((label) => canonicalGenreByLabel.set(normalizeGenre(label), canonical));
  definition.aliases?.forEach((label) => canonicalGenreByLabel.set(normalizeGenre(label), canonical));
}

export function getCanonicalGenre(value: string): string {
  return canonicalGenreByLabel.get(normalizeGenre(value)) ?? value.trim();
}

export function hasGenreTranslation(value: string): boolean {
  return canonicalGenreByLabel.has(normalizeGenre(value));
}

export function getGenreTranslation(value: string, locale: Locale = "zh-CN"): string {
  const canonical = getCanonicalGenre(value);
  return genreTranslations[canonical as CanonicalGenre]?.[locale] ?? value;
}

const award = (zhCN: string, zhTW: string, en: string, ja: string, fr: string): TranslationMap =>
  ({ "zh-CN": zhCN, "zh-TW": zhTW, en, ja, fr });

const awardTranslations: Record<string, TranslationMap> = {
  "Academy Award": award("奥斯卡奖", "奧斯卡獎", "Academy Award", "アカデミー賞", "Oscar"),
  Oscar: award("奥斯卡", "奧斯卡", "Oscar", "オスカー", "Oscar"),
  "Golden Globe": award("金球奖", "金球獎", "Golden Globe", "ゴールデングローブ賞", "Golden Globe"),
  BAFTA: award("英国电影学院奖", "英國電影學院獎", "BAFTA", "英国アカデミー賞", "BAFTA"),
  "Cannes Film Festival": award("戛纳电影节", "坎城影展", "Cannes Film Festival", "カンヌ国際映画祭", "Festival de Cannes"),
  "Venice Film Festival": award("威尼斯电影节", "威尼斯影展", "Venice Film Festival", "ヴェネツィア国際映画祭", "Mostra de Venise"),
  "Berlin Film Festival": award("柏林电影节", "柏林影展", "Berlin Film Festival", "ベルリン国際映画祭", "Berlinale"),
  "Sundance Film Festival": award("圣丹斯电影节", "日舞影展", "Sundance Film Festival", "サンダンス映画祭", "Festival de Sundance"),
  Emmy: award("艾美奖", "艾美獎", "Emmy", "エミー賞", "Emmy"),
  Grammy: award("格莱美奖", "葛萊美獎", "Grammy", "グラミー賞", "Grammy"),
  "Best Picture": award("最佳影片", "最佳影片", "Best Picture", "作品賞", "Meilleur film"),
  "Best Director": award("最佳导演", "最佳導演", "Best Director", "監督賞", "Meilleure réalisation"),
  "Best Actor": award("最佳男主角", "最佳男主角", "Best Actor", "主演男優賞", "Meilleur acteur"),
  "Best Actress": award("最佳女主角", "最佳女主角", "Best Actress", "主演女優賞", "Meilleure actrice"),
  "Best Supporting Actor": award("最佳男配角", "最佳男配角", "Best Supporting Actor", "助演男優賞", "Meilleur acteur dans un second rôle"),
  "Best Supporting Actress": award("最佳女配角", "最佳女配角", "Best Supporting Actress", "助演女優賞", "Meilleure actrice dans un second rôle"),
  "Best Original Screenplay": award("最佳原创剧本", "最佳原創劇本", "Best Original Screenplay", "脚本賞", "Meilleur scénario original"),
  "Best Adapted Screenplay": award("最佳改编剧本", "最佳改編劇本", "Best Adapted Screenplay", "脚色賞", "Meilleur scénario adapté"),
  "Best Cinematography": award("最佳摄影", "最佳攝影", "Best Cinematography", "撮影賞", "Meilleure photographie"),
  "Best Editing": award("最佳剪辑", "最佳剪輯", "Best Editing", "編集賞", "Meilleur montage"),
  "Best Original Song": award("最佳原创歌曲", "最佳原創歌曲", "Best Original Song", "歌曲賞", "Meilleure chanson originale"),
  "Best Animated Feature": award("最佳动画长片", "最佳動畫長片", "Best Animated Feature", "長編アニメ映画賞", "Meilleur film d’animation"),
  "Best Foreign Language Film": award("最佳外语片", "最佳外語片", "Best Foreign Language Film", "外国語映画賞", "Meilleur film en langue étrangère"),
  "Best International Feature": award("最佳国际影片", "最佳國際影片", "Best International Feature", "国際長編映画賞", "Meilleur film international"),
  "Palme d'Or": award("金棕榈奖", "金棕櫚獎", "Palme d'Or", "パルム・ドール", "Palme d’Or"),
  "Golden Bear": award("金熊奖", "金熊獎", "Golden Bear", "金熊賞", "Ours d’or"),
  "Golden Lion": award("金狮奖", "金獅獎", "Golden Lion", "金獅子賞", "Lion d’or"),
  "Audience Award": award("观众选择奖", "觀眾票選獎", "Audience Award", "観客賞", "Prix du public"),
  "Official Selection": award("官方入选", "官方入選", "Official Selection", "公式選出", "Sélection officielle"),
  Nomination: award("提名", "提名", "Nomination", "ノミネート", "Nomination"),
  Winner: award("获奖", "獲獎", "Winner", "受賞", "Lauréat"),
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function translateAward(awardText: string, locale: Locale = "zh-CN"): string {
  if (locale === "en") return awardText;

  const direct = awardTranslations[awardText]?.[locale];
  if (direct) return direct;

  return Object.keys(awardTranslations)
    .sort((a, b) => b.length - a.length)
    .reduce((translated, key) => translated.replace(
      new RegExp(escapeRegExp(key), "g"),
      awardTranslations[key][locale],
    ), awardText);
}
