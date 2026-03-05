// Film genre translation utilities
export type Genre =
  | 'Action' | 'Comedy' | 'Drama' | 'Thriller' | 'Horror' | 'Romance'
  | 'Sci-Fi' | 'Science Fiction' | 'Fantasy' | 'Documentary' | 'Animation' | 'Musical'
  | 'Coming-of-Age' | 'Cultural Identity' | 'Biography' | 'History'
  | 'Crime' | 'Mystery' | 'War' | 'Western' | 'Family' | 'Adventure'
  | 'Social Realism' | 'Sport' | 'Sports' | 'Historical' | 'Art House'
  | 'LGBTQ+' | 'Dark Comedy' | 'Period Drama' | 'Independent' | 'Experimental'
  | 'Road Movie' | 'Black Comedy' | 'Social Issues' | 'Feminist'
  | 'Superhero' | 'Body Horror' | 'Psychological' | 'Journalism'
  | 'Music' | 'Period';

const genreTranslations: Record<Genre, { 'zh-CN': string; 'en': string }> = {
  'Action': { 'zh-CN': '动作', 'en': 'Action' },
  'Comedy': { 'zh-CN': '喜剧', 'en': 'Comedy' },
  'Drama': { 'zh-CN': '剧情', 'en': 'Drama' },
  'Thriller': { 'zh-CN': '惊悚', 'en': 'Thriller' },
  'Horror': { 'zh-CN': '恐怖', 'en': 'Horror' },
  'Romance': { 'zh-CN': '爱情', 'en': 'Romance' },
  'Sci-Fi': { 'zh-CN': '科幻', 'en': 'Sci-Fi' },
  'Science Fiction': { 'zh-CN': '科幻', 'en': 'Science Fiction' },
  'Fantasy': { 'zh-CN': '奇幻', 'en': 'Fantasy' },
  'Documentary': { 'zh-CN': '纪录片', 'en': 'Documentary' },
  'Animation': { 'zh-CN': '动画', 'en': 'Animation' },
  'Musical': { 'zh-CN': '音乐剧', 'en': 'Musical' },
  'Coming-of-Age': { 'zh-CN': '成长', 'en': 'Coming-of-Age' },
  'Cultural Identity': { 'zh-CN': '文化身份', 'en': 'Cultural Identity' },
  'Biography': { 'zh-CN': '传记', 'en': 'Biography' },
  'History': { 'zh-CN': '历史', 'en': 'History' },
  'Crime': { 'zh-CN': '犯罪', 'en': 'Crime' },
  'Mystery': { 'zh-CN': '悬疑', 'en': 'Mystery' },
  'War': { 'zh-CN': '战争', 'en': 'War' },
  'Western': { 'zh-CN': '西部', 'en': 'Western' },
  'Family': { 'zh-CN': '家庭', 'en': 'Family' },
  'Adventure': { 'zh-CN': '冒险', 'en': 'Adventure' },
  'Social Realism': { 'zh-CN': '社会现实', 'en': 'Social Realism' },
  'Sport': { 'zh-CN': '体育', 'en': 'Sport' },
  'Sports': { 'zh-CN': '体育', 'en': 'Sports' },
  'Historical': { 'zh-CN': '历史', 'en': 'Historical' },
  'Art House': { 'zh-CN': '艺术', 'en': 'Art House' },
  'LGBTQ+': { 'zh-CN': 'LGBTQ+', 'en': 'LGBTQ+' },
  'Dark Comedy': { 'zh-CN': '黑色喜剧', 'en': 'Dark Comedy' },
  'Period Drama': { 'zh-CN': '古装剧', 'en': 'Period Drama' },
  'Independent': { 'zh-CN': '独立电影', 'en': 'Independent' },
  'Experimental': { 'zh-CN': '实验', 'en': 'Experimental' },
  'Road Movie': { 'zh-CN': '公路', 'en': 'Road Movie' },
  'Black Comedy': { 'zh-CN': '黑色喜剧', 'en': 'Black Comedy' },
  'Social Issues': { 'zh-CN': '社会议题', 'en': 'Social Issues' },
  'Feminist': { 'zh-CN': '女性主义', 'en': 'Feminist' },
  'Superhero': { 'zh-CN': '超级英雄', 'en': 'Superhero' },
  'Body Horror': { 'zh-CN': '身体恐怖', 'en': 'Body Horror' },
  'Psychological': { 'zh-CN': '心理', 'en': 'Psychological' },
  'Journalism': { 'zh-CN': '新闻', 'en': 'Journalism' },
  'Music': { 'zh-CN': '音乐', 'en': 'Music' },
  'Period': { 'zh-CN': '时代', 'en': 'Period' }
};

export function getGenreTranslation(genre: string, locale: string = 'zh-CN'): string {
  const translation = genreTranslations[genre as Genre];
  if (translation && (translation as any)[locale]) {
    return (translation as any)[locale];
  }
  // Return original genre if no translation found
  return genre;
}

// Common award translations
const awardTranslations: Record<string, { 'zh-CN': string; 'en': string }> = {
  'Academy Award': { 'zh-CN': '奥斯卡奖', 'en': 'Academy Award' },
  'Oscar': { 'zh-CN': '奥斯卡', 'en': 'Oscar' },
  'Golden Globe': { 'zh-CN': '金球奖', 'en': 'Golden Globe' },
  'BAFTA': { 'zh-CN': '英国电影学院奖', 'en': 'BAFTA' },
  'Cannes Film Festival': { 'zh-CN': '戛纳电影节', 'en': 'Cannes Film Festival' },
  'Venice Film Festival': { 'zh-CN': '威尼斯电影节', 'en': 'Venice Film Festival' },
  'Berlin Film Festival': { 'zh-CN': '柏林电影节', 'en': 'Berlin Film Festival' },
  'Sundance Film Festival': { 'zh-CN': '圣丹斯电影节', 'en': 'Sundance Film Festival' },
  'Emmy': { 'zh-CN': '艾美奖', 'en': 'Emmy' },
  'Tony Award': { 'zh-CN': '托尼奖', 'en': 'Tony Award' },
  'Grammy': { 'zh-CN': '格莱美奖', 'en': 'Grammy' },
  'Best Picture': { 'zh-CN': '最佳影片', 'en': 'Best Picture' },
  'Best Director': { 'zh-CN': '最佳导演', 'en': 'Best Director' },
  'Best Actor': { 'zh-CN': '最佳男主角', 'en': 'Best Actor' },
  'Best Actress': { 'zh-CN': '最佳女主角', 'en': 'Best Actress' },
  'Best Supporting Actor': { 'zh-CN': '最佳男配角', 'en': 'Best Supporting Actor' },
  'Best Supporting Actress': { 'zh-CN': '最佳女配角', 'en': 'Best Supporting Actress' },
  'Best Original Screenplay': { 'zh-CN': '最佳原创剧本', 'en': 'Best Original Screenplay' },
  'Best Adapted Screenplay': { 'zh-CN': '最佳改编剧本', 'en': 'Best Adapted Screenplay' },
  'Best Cinematography': { 'zh-CN': '最佳摄影', 'en': 'Best Cinematography' },
  'Best Editing': { 'zh-CN': '最佳剪辑', 'en': 'Best Editing' },
  'Best Score': { 'zh-CN': '最佳配乐', 'en': 'Best Score' },
  'Best Original Song': { 'zh-CN': '最佳原创歌曲', 'en': 'Best Original Song' },
  'Best Visual Effects': { 'zh-CN': '最佳视觉效果', 'en': 'Best Visual Effects' },
  'Best Animated Feature': { 'zh-CN': '最佳动画长片', 'en': 'Best Animated Feature' },
  'Best Foreign Language Film': { 'zh-CN': '最佳外语片', 'en': 'Best Foreign Language Film' },
  'Best International Feature': { 'zh-CN': '最佳国际影片', 'en': 'Best International Feature' },
  'Palme d\'Or': { 'zh-CN': '金棕榈奖', 'en': 'Palme d\'Or' },
  'Golden Bear': { 'zh-CN': '金熊奖', 'en': 'Golden Bear' },
  'Golden Lion': { 'zh-CN': '金狮奖', 'en': 'Golden Lion' },
  'Audience Award': { 'zh-CN': '观众选择奖', 'en': 'Audience Award' },
  'Critics\' Choice': { 'zh-CN': '影评人选择奖', 'en': 'Critics\' Choice' },
  'Screen Actors Guild Award': { 'zh-CN': '美国演员工会奖', 'en': 'Screen Actors Guild Award' },
  'Directors Guild Award': { 'zh-CN': '美国导演工会奖', 'en': 'Directors Guild Award' },
  'Writers Guild Award': { 'zh-CN': '美国编剧工会奖', 'en': 'Writers Guild Award' },
  'British Independent Film Award': { 'zh-CN': '英国独立电影奖', 'en': 'British Independent Film Award' },
  'Best Debut': { 'zh-CN': '最佳处女作', 'en': 'Best Debut' },
  'Best Debut Screenwriter': { 'zh-CN': '最佳处女作编剧', 'en': 'Best Debut Screenwriter' },
  'Premiere': { 'zh-CN': '首映', 'en': 'Premiere' },
  'World Premiere': { 'zh-CN': '全球首映', 'en': 'World Premiere' },
  'Official Selection': { 'zh-CN': '官方入选', 'en': 'Official Selection' },
  'Competition': { 'zh-CN': '竞赛单元', 'en': 'Competition' },
  'Nomination': { 'zh-CN': '提名', 'en': 'Nomination' },
  'Winner': { 'zh-CN': '获奖', 'en': 'Winner' },
  'Favorite Films': { 'zh-CN': '最爱电影', 'en': 'Favorite Films' }
};

/**
 * Translate award text intelligently
 * Attempts to match known awards and translate them
 * For complex award descriptions, it translates known components
 */
export function translateAward(awardText: string, locale: string = 'zh-CN'): string {
  if (locale === 'en') {
    return awardText; // English awards stay in English
  }

  // Try direct match first
  if (awardTranslations[awardText] && (awardTranslations[awardText] as any)[locale]) {
    return (awardTranslations[awardText] as any)[locale];
  }

  // Try partial matches for complex award descriptions
  let translatedText = awardText;

  // Sort by length (longest first) to avoid partial replacement issues
  const sortedKeys = Object.keys(awardTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if ((awardTranslations[key] as any)[locale]) {
      translatedText = translatedText.replace(
        new RegExp(key, 'g'),
        (awardTranslations[key] as any)[locale]
      );
    }
  }

  // Handle specific patterns
  translatedText = translatedText
    .replace(/(\d{4})/g, '$1年') // Add 年 after years
    .replace(/Barack Obama's/g, '巴拉克·奥巴马的')
    .replace(/Obama's/g, '奥巴马的');

  return translatedText;
}