import type { Locale } from "../i18n";
import {
  type ContentType,
  getPublishedLocaleContent,
  groupContentByType,
  type NormalizedContent,
} from "./content";
import {
  type IssueMediaQuotas,
  selectIssueItems,
} from "./issueSelection";
import { getIssueNumber } from "./issuePresentation";

export interface IssueCopy {
  theme: string;
  title: string;
  deck: string;
}

export interface IssueDefinition {
  slug: string;
  current?: boolean;
  /**
   * Canonical topic names whose content is aggregated into this issue.
   * Keep the list narrow and on-theme: after the curated anchors, remaining
   * seats are filled by topic relevance and date within the media quotas.
   */
  topics: string[];
  /**
   * Hard editorial ceilings for each medium. This keeps a recent, abundant
   * format from displacing the rest of the issue.
   */
  mediaQuotas?: IssueMediaQuotas;
  /**
   * Stable editorial anchors. Topic/date ranking only fills seats left after
   * these resources have been selected.
   */
  curatedSlugs?: string[];
  /** Optional cleanSlug of the curated cover resource; falls back to the first aggregated item with an image. */
  coverSlug?: string;
  /** Resources that extend the cover story into the homepage idea atlas. */
  connectionSlugs?: string[];
  copy: Record<Locale, IssueCopy>;
}

/** Maximum number of resources an issue may gather. */
export const ISSUE_ITEM_LIMIT = 30;

export const issueDefinitions: IssueDefinition[] = [
  {
    slug: "intimacy",
    current: true,
    topics: [
      "Female Friendship",
      "Marriage Critique",
      "Emotional Labor",
      "Identity and Selfhood",
      "Ethics of Care",
    ],
    mediaQuotas: {
      book: 8,
      film: 9,
      article: 2,
      video: 3,
      podcast: 5,
      paper: 3,
    },
    curatedSlugs: [
      "happy-hour-2015",
      "womens-room-marilyn-french",
      "my-brilliant-friend",
      "all-about-love",
      "different-voice-carol-gilligan",
      "breasts-and-eggs",
      "argonauts",
      "the-will-to-change",
      "essential-labor",
      "all-we-imagine-as-light-2024",
      "women-talking-2022",
      "cleo-from-5-to-7-1962",
      "portrait-of-a-lady-on-fire",
      "little-big-women-2020",
      "rocks-2019",
      "thelma-and-louise",
      "mustang-2015",
      "access-intimacy-missing-link",
      "forced-intimacy-ableist-norm",
      "ali-wong-don-wong",
      "ali-wong-hard-knock-wife",
      "eve-ensler-inner-girl",
      "decolonizing-sex",
      "feminist-survival-project",
      "feminist-wellness",
      "masala-podcast",
      "black-feminist-rants",
      "compulsory-heterosexuality-lesbian-existence-rich",
      "reconceiving-citizenship-mothers-activists",
      "thinking-through-breasts-maternity",
    ],
    coverSlug: "happy-hour-2015",
    connectionSlugs: [
      "womens-room-marilyn-french",
      "access-intimacy-missing-link",
      "compulsory-heterosexuality-lesbian-existence-rich",
      "all-we-imagine-as-light-2024",
    ],
    copy: {
      "zh-CN": {
        theme: "亲密",
        title: "我们真的听见彼此了吗？",
        deck: "从女性友谊、婚姻裂缝到照护、欲望与离开，本期把亲密关系视为一个政治现场：谁有说真话的空间，谁的沉默被误读，又是谁长期没有被听见。",
      },
      "zh-TW": {
        theme: "親密",
        title: "我們真的聽見彼此了嗎？",
        deck: "從女性友誼、婚姻裂縫到照護、欲望與離開，本期把親密關係視為一個政治現場：誰有說真話的空間，誰的沉默被誤讀，又是誰長期沒有被聽見。",
      },
      en: {
        theme: "Intimacy",
        title: "Are we really listening to one another?",
        deck: "Across friendship, strained marriages, care, desire and departure, this issue treats intimacy as a political field: who has room to speak, whose silence is misread, and who is never heard.",
      },
      ja: {
        theme: "親密さ",
        title: "私たちは本当に互いの声を聴いているか？",
        deck: "女性同士の友情、きしむ結婚生活、ケア、欲望、別れ。本号は親密さを政治の場として捉え、誰に本音を語る余地があり、誰の沈黙が読み違えられ、誰の声が聞かれないままなのかを問います。",
      },
      fr: {
        theme: "L’intimité",
        title: "Est-ce qu’on s’écoute vraiment ?",
        deck: "De l’amitié entre femmes aux mariages qui se fissurent, du soin au désir et au départ, ce numéro envisage l’intimité comme un espace politique : qui peut dire vrai, quels silences sont mal interprétés et quelles voix restent inaudibles.",
      },
    },
  },
  {
    slug: "body",
    topics: [
      "Body Politics",
      "Bodily Autonomy",
      "Beauty Standards",
    ],
    mediaQuotas: {
      book: 6,
      film: 6,
      article: 5,
      video: 4,
      podcast: 4,
      paper: 5,
    },
    curatedSlugs: [
      "the-beauty-myth",
      "naked-feminism",
      "body-liberation-project",
      "hags",
      "all-in-her-head",
      "trans-bodies-trans-selves",
      "the-substance-2024",
      "cleo-from-5-to-7-1962",
      "real-women-have-curves-2002",
      "happening-2021",
      "poor-things-2023",
      "are-you-there-god-its-me-margaret-2023",
      "moving-toward-the-ugly",
      "forced-intimacy-ableist-norm",
      "changing-framework-disability-justice",
      "digital-surveillance-reproductive-rights",
      "us-war-on-reproductive-rights",
      "olisunvia-autonomy",
      "woman-documentary",
      "stella-young-not-your-inspiration",
      "maysoon-zayid-99-problems-palsy",
      "decolonizing-sex",
      "the-fat-feminist-witch",
      "feminist-wellness",
      "masala-podcast",
      "visual-pleasure-narrative-cinema",
      "throwing-like-a-girl",
      "feminist-disability-studies-garland-thomson",
      "reproductive-justice-intersectional-feminist-activism-ross",
      "toward-feminist-theory-disability-wendell",
    ],
    coverSlug: "the-substance-2024",
    connectionSlugs: [
      "the-beauty-myth",
      "visual-pleasure-narrative-cinema",
      "throwing-like-a-girl",
      "feminist-disability-studies-garland-thomson",
    ],
    copy: {
      "zh-CN": {
        theme: "身体",
        title: "谁有权定义身体？",
        deck: "从身体规训、衰老恐惧到自我凝视，本期沿着作品与思想之间的联系，重新理解身体如何被观看、命名与夺回。",
      },
      "zh-TW": {
        theme: "身體",
        title: "誰有權定義身體？",
        deck: "從身體規訓、衰老恐懼到自我凝視，本期沿著作品與思想之間的聯繫，重新理解身體如何被觀看、命名與奪回。",
      },
      en: {
        theme: "The body",
        title: "Who gets to define the body?",
        deck: "From discipline and ageing to the internalised gaze, this issue follows the forces that watch, name and reclaim the body.",
      },
      ja: {
        theme: "身体",
        title: "身体を定義するのは誰か？",
        deck: "身体の規律、老いへの恐怖、内面化されたまなざし。本号では作品と思想のつながりから、身体を見つめ直します。",
      },
      fr: {
        theme: "Le corps",
        title: "Qui a le droit de définir le corps ?",
        deck: "De la discipline corporelle à la peur de vieillir et au regard intériorisé, ce numéro suit les forces qui observent, nomment et reconquièrent le corps.",
      },
    },
  },
  {
    slug: "identity",
    topics: [
      "Identity Formation",
      "Gender Identity",
      "Identity and Selfhood",
    ],
    copy: {
      "zh-CN": {
        theme: "身份",
        title: "我是谁，由谁说了算？",
        deck: "从性别认同到流散与迁徙，本期追问身份如何被赋予、被争夺，又如何被自己重新书写。",
      },
      "zh-TW": {
        theme: "身份",
        title: "我是誰，由誰說了算？",
        deck: "從性別認同到流散與遷徙，本期追問身份如何被賦予、被爭奪，又如何被自己重新書寫。",
      },
      en: {
        theme: "Identity",
        title: "Who gets to say who we are?",
        deck: "From gender identity to diaspora and migration, this issue asks how identities are assigned, contested, and rewritten on our own terms.",
      },
      ja: {
        theme: "アイデンティティ",
        title: "私は誰——誰が決めるのか？",
        deck: "ジェンダー・アイデンティティからディアスポラ、移住まで。アイデンティティがどう与えられ、奪い合われ、自分の手で書き換えられるかを問います。",
      },
      fr: {
        theme: "Identité",
        title: "Qui décide de qui nous sommes ?",
        deck: "De l’identité de genre à la diaspora et aux migrations, ce numéro interroge la manière dont les identités sont assignées, contestées et réécrites par celles et ceux qui les vivent.",
      },
    },
  },
  {
    slug: "domestic-labor",
    topics: [
      "Domestic Labor",
      "Reproductive Labor",
      "Emotional Labor",
      "Care Economy",
    ],
    mediaQuotas: {
      book: 9,
      film: 7,
      article: 1,
      video: 4,
      podcast: 3,
      paper: 6,
    },
    curatedSlugs: [
      "servants-of-globalization",
      "disposable-domestics",
      "maid-to-order-in-hong-kong",
      "global-woman",
      "smart-wife",
      "essential-labor",
      "care-work-dreaming-disability-justice",
      "the-managed-heart",
      "doing-the-dirty-work",
      "the-chambermaid-2018",
      "the-second-mother-2015",
      "jeanne-dielman-1975",
      "lingua-franca-2019",
      "roma-2018",
      "the-babadook-2014",
      "i-will-follow-2011",
      "access-intimacy-missing-link",
      "ai-jen-poo-work-that-makes-all-work-possible",
      "olisunvia-autonomy",
      "ali-wong-baby-cobra",
      "eve-ensler-inner-girl",
      "how-to-care-for-caregivers-ai-jen-poo",
      "feminist-survival-project",
      "gender-at-work",
      "love-and-gold-hochschild",
      "migrant-filipina-domestic-workers-parrenas",
      "globalization-transnational-care-work-pyle",
      "wages-against-housework-federici",
      "gender-migration-care-deficits-gammage-stevanovic",
      "the-feminist-standpoint",
    ],
    copy: {
      "zh-CN": {
        theme: "家务",
        title: "谁在做看不见的劳动？",
        deck: "做饭、清扫、照料与情绪劳动——本期把家务与再生产劳动放回政治现场，追问它为何长期被视为无偿与理所当然。",
      },
      "zh-TW": {
        theme: "家務",
        title: "誰在做看不見的勞動？",
        deck: "做飯、清掃、照料與情緒勞動——本期把家務與再生產勞動放回政治現場，追問它為何長期被視為無償與理所當然。",
      },
      en: {
        theme: "Domestic labor",
        title: "Who does the invisible work?",
        deck: "Cooking, cleaning, care and emotional labor — this issue returns domestic and reproductive work to the political stage, and asks why it was ever treated as free and natural.",
      },
      ja: {
        theme: "家事",
        title: "見えない労働を誰が担っているのか？",
        deck: "料理、掃除、ケア、感情労働——家事と再生産労働を政治の現場に取り戻し、なぜそれが無償で当然とされてきたのかを問います。",
      },
      fr: {
        theme: "Travail domestique",
        title: "Qui fait le travail invisible ?",
        deck: "Cuisine, ménage, soin et travail émotionnel — ce numéro replace le travail domestique et reproductif sur la scène politique et demande pourquoi il a si longtemps été tenu pour gratuit et naturel.",
      },
    },
  },
];

export interface IssueView {
  definition: IssueDefinition;
  copy: IssueCopy;
  number: number;
  cover: NormalizedContent | undefined;
  items: NormalizedContent[];
  contentByType: Record<ContentType, NormalizedContent[]>;
}

function toView(
  definition: IssueDefinition,
  number: number,
  content: NormalizedContent[],
  locale: Locale,
): IssueView {
  const items = selectIssueItems(
    content,
    definition.topics,
    {
      mediaQuotas: definition.mediaQuotas,
      curatedSlugs: definition.curatedSlugs,
    },
    ISSUE_ITEM_LIMIT,
  );
  const cover =
    (definition.coverSlug &&
      content.find((item) => item.cleanSlug === definition.coverSlug)) ||
    items.find((item) => item.image) ||
    items[0];

  return {
    definition,
    copy: definition.copy[locale],
    number,
    cover,
    items,
    contentByType: groupContentByType(items),
  };
}

export async function buildIssueIndexView(
  locale: Locale,
): Promise<IssueView[]> {
  const content = await getPublishedLocaleContent(locale);
  return issueDefinitions.map((definition, index) =>
    toView(
      definition,
      getIssueNumber(index, issueDefinitions.length),
      content,
      locale,
    ),
  );
}

export async function buildIssueView(
  slug: string,
  locale: Locale,
): Promise<IssueView | undefined> {
  const index = issueDefinitions.findIndex(
    (definition) => definition.slug === slug,
  );
  if (index === -1) return undefined;
  const content = await getPublishedLocaleContent(locale);
  return toView(
    issueDefinitions[index],
    getIssueNumber(index, issueDefinitions.length),
    content,
    locale,
  );
}

export function getIssueStaticPaths() {
  return issueDefinitions.map((definition) => ({
    params: { slug: definition.slug },
    props: { slug: definition.slug },
  }));
}

export function getLocalizedIssueStaticPaths(locales: readonly Locale[]) {
  return locales.flatMap((locale) =>
    issueDefinitions.map((definition) => ({
      params: { locale, slug: definition.slug },
      props: { slug: definition.slug },
    })),
  );
}
