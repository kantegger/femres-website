import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

test('Discussion receives compact copy instead of bundling every locale catalog', () => {
  const discussion = read('src/components/Discussion.tsx');

  assert.doesNotMatch(discussion, /i18n\/locales\/.+\.json/);
  assert.match(discussion, /copy:\s*DiscussionCopy/);
});

test('detail discussions hydrate only when they approach the viewport', () => {
  const detailComponents = [
    'EditorialArticleDetail.astro',
    'EditorialBookDetail.astro',
    'EditorialFilmDetail.astro',
    'EditorialPaperDetail.astro',
    'EditorialPodcastDetail.astro',
    'EditorialVideoDetail.astro',
  ];

  for (const component of detailComponents) {
    const source = read(`src/components/${component}`);
    assert.doesNotMatch(source, /<Discussion[\s\S]*?client:load/);
    assert.match(source, /<Discussion[\s\S]*?client:visible/);
  }
});

test('like counts support one batched request for many content cards', () => {
  const interactions = read('src/components/InteractionButtons.tsx');
  const endpoint = read('src/pages/api/likes/count.ts');
  const database = read('src/lib/db.ts');

  assert.match(interactions, /requestLikeCount\(contentId\)/);
  assert.match(endpoint, /contentIds/);
  assert.match(endpoint, /getLikeCounts/);
  assert.match(database, /export async function getLikeCounts/);
});

test('comment loading exposes an error state and retry action', () => {
  const discussion = read('src/components/Discussion.tsx');

  assert.match(discussion, /commentsError/);
  assert.match(discussion, /onClick=\{loadComments\}/);
  assert.match(discussion, /copy\.retry/);
});

test('book details suppress legacy Amazon affiliate links without deleting sources', async () => {
  const detail = read('src/components/EditorialBookDetail.astro');
  const externalLinks = read('src/lib/externalLinks.ts');
  const { isPublicSourceUrl } = await import('../src/lib/externalLinks.ts');

  assert.match(detail, /isPublicSourceUrl\(book\.data\.sourceUrl\)/);
  assert.match(externalLinks, /searchParams\.has\(["']tag["']\)/);
  assert.match(externalLinks, /amazon/);
  assert.equal(isPublicSourceUrl('https://www.amazon.sg/s?k=feminism&tag=inkrupt-22'), false);
  assert.equal(isPublicSourceUrl('https://publisher.example/books/feminism'), true);
});

test('articles and papers keep source previews separate from editorial imagery', () => {
  const content = read('src/lib/content.ts');
  const articleDetail = read('src/components/EditorialArticleDetail.astro');
  const search = read('src/components/EditorialSearch.astro');
  const topicRows = read('src/components/EditorialTopicRows.astro');
  const articlePage = read('src/pages/articles/[...slug].astro');
  const paperPage = read('src/pages/papers/[...slug].astro');

  assert.doesNotMatch(content, /image:\s*entry\.data\.featuredImage/);
  assert.match(content, /image:\s*entry\.data\.editorialImage/);
  assert.doesNotMatch(articleDetail, /article-lead-image/);
  assert.match(articleDetail, /article-source-preview/);
  assert.doesNotMatch(articleDetail, /related\.data\.featuredImage/);
  assert.match(search, /textOnlyContentTypes/);
  assert.match(topicRows, /textOnlyContentTypes/);
  assert.match(articlePage, /getEditorialShareImage\("article"\)/);
  assert.match(paperPage, /getEditorialShareImage\("paper"\)/);
});

test('language switchers work before hydration through native disclosure controls', () => {
  const header = read('src/components/EditorialHeader.astro');
  const switcher = read('src/components/LanguageSwitcher.tsx');

  const switchers = header.match(/<LanguageSwitcher[^>]*\/>/g) ?? [];
  assert.equal(switchers.length, 2);
  assert.ok(switchers.every((instance) => !instance.includes('client:')));
  assert.match(switcher, /<details/);
  assert.match(switcher, /<summary/);
  assert.doesNotMatch(switcher, /useState|onClick/);
});

test('legal pages describe the services and data flows that actually exist', () => {
  const locales = ['', '-en', '-fr', '-ja', '-tw'];
  const privacyPages = locales.map((suffix) => read(`src/content/pages/privacy${suffix}.md`));
  const termsPages = locales.map((suffix) => read(`src/content/pages/terms${suffix}.md`));

  for (const page of [...privacyPages, ...termsPages]) {
    assert.match(page, /lastUpdated: 2026-07-22/);
  }

  for (const page of privacyPages) {
    assert.match(page, /Formspree/);
    assert.match(page, /Vercel/);
    assert.match(page, /Supabase/);
    assert.match(page, /Cloudflare R2/);
  }

  assert.doesNotMatch(privacyPages[1], /Provide personalized content recommendations/);
  assert.doesNotMatch(termsPages[1], /AI-driven curation/);
  assert.doesNotMatch(termsPages[0], /AI驱动的策展/);
});
