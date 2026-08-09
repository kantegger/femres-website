import { expect, test } from '@playwright/test';

const editorialResourceOrder = ['Books', 'Films', 'Videos', 'Podcasts', 'Articles', 'Papers'];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
  });
  await page.route('**/api/likes/count?*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"count":0}' });
  });
  await page.route(/\/api\/comments(?:\/|$)/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"comments":[]}' });
  });
});

test('reader can move from the current issue into a cover story', async ({ page }) => {
  await page.goto('/en/');

  await expect(page.getByRole('heading', { level: 1, name: 'Are we really listening to one another?' })).toBeVisible();
  const coverStory = page.getByRole('link', { name: 'Read the cover story', exact: true });
  await expect(coverStory).toHaveAttribute('href', '/en/films/happy-hour-2015');

  await coverStory.click();
  await expect(page).toHaveURL(/\/en\/films\/happy-hour-2015$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Happy Hour' })).toBeVisible();
  await expect(page.locator('.film-hero')).toHaveAttribute('data-motion-state', 'revealed');
  await expect(page.locator('.film-source-list a span')).toHaveText([
    'IMDb',
    'Douban',
    'Official Site',
    'Japanese Film Database',
  ]);
  await expect(page.locator('.film-source-list a strong')).toHaveText([
    '7.6/10',
    '8.7/10',
    '↗',
    '↗',
  ]);
});

test('current issue navigation returns to the top of the homepage', async ({ page }) => {
  await page.goto('/en/');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const currentIssueLink = page.locator('.editorial-nav').getByRole('link', { name: 'Current', exact: true });
  await expect(currentIssueLink).toHaveAttribute('href', '/en/');
  await currentIssueLink.click();

  await expect(page).toHaveURL(/\/en\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Open menu' }).click();
  const mobileCurrentIssueLink = page.locator('#editorial-mobile-nav').getByRole('link', { name: 'Current', exact: true });
  await expect(mobileCurrentIssueLink).toHaveAttribute('href', '/en/');
  await mobileCurrentIssueLink.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('resource type surfaces share one editorial order', async ({ page }) => {
  const surfaces = [
    { path: '/en/', selector: '.issue-body__group h3 span' },
    { path: '/en/issues/intimacy', selector: '.issue-detail__section h3 span' },
    { path: '/en/library', selector: '.library-page__index strong' },
    { path: '/en/topics/female-friendship', selector: '.topic-media nav strong' },
    { path: '/en/about', selector: '.medium-index strong' },
  ];

  for (const surface of surfaces) {
    await page.goto(surface.path);
    await expect(page.locator(surface.selector)).toHaveText(editorialResourceOrder);
  }

  await page.goto('/en/search');
  await expect(page.locator('.search-media nav a:not(:first-child) strong')).toHaveText(editorialResourceOrder);
});

test('current issue keeps its editorial rhythm on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');

  const title = page.getByRole('heading', { level: 1, name: 'Are we really listening to one another?' });
  const titleMetrics = await title.evaluate((element) => {
    const style = getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize);
    return {
      fontSize,
      lineHeight: Number.parseFloat(style.lineHeight),
    };
  });

  expect(titleMetrics.fontSize).toBeLessThanOrEqual(54);
  expect(titleMetrics.lineHeight / titleMetrics.fontSize).toBeGreaterThanOrEqual(1.02);

  const textOnlyConnection = page.locator('.network-node:not(.network-node--with-image)').first();
  const [labelBox, titleBox, authorBox, connectionBox] = await Promise.all([
    textOnlyConnection.locator('span').boundingBox(),
    textOnlyConnection.locator('strong').boundingBox(),
    textOnlyConnection.locator('small').boundingBox(),
    textOnlyConnection.boundingBox(),
  ]);

  expect(labelBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(authorBox).not.toBeNull();
  expect(connectionBox).not.toBeNull();
  expect(Math.abs(labelBox!.x - titleBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(authorBox!.x - titleBox!.x)).toBeLessThanOrEqual(1);
  expect(connectionBox!.height).toBeLessThan(150);
});

test('homepage issue features remain image-free and layout stable', async ({ page }) => {
  await page.goto('/en/');
  const featureImages = page.locator('.issue-feature__media img');
  const total = await featureImages.count();
  expect(total).toBe(0);
  await page.locator('.issue-feature').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.issue-feature')).toHaveCount(5);
  const leadFeature = page.locator('.issue-feature--lead');
  const secondaryFeatures = page.locator('.issue-feature--slot-0, .issue-feature--slot-1, .issue-feature--slot-2, .issue-feature--slot-3');
  await expect(leadFeature).toBeVisible();
  await expect(secondaryFeatures).toHaveCount(4);
  await expect(page.locator('.issue-feature__title')).toHaveCount(5);
});

test('homepage magazine body lays out features and section lists at intermediate widths', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto('/en/');

  await expect(page.locator('.issue-feature')).toHaveCount(5);
  const groups = page.locator('.issue-body__group');
  expect(await groups.count()).toBeGreaterThanOrEqual(2);

  const firstList = page.locator('.issue-list').first();
  await firstList.scrollIntoViewIfNeeded();
  const listStyle = await firstList.evaluate((list) => getComputedStyle(list).columnCount);
  expect(listStyle).toBe('2');

  const firstEntry = page.locator('.issue-list a').first();
  const entryBox = await firstEntry.boundingBox();
  expect(entryBox).not.toBeNull();
  expect(entryBox!.width).toBeGreaterThan(200);
});

test('homepage atlas and highlights remain legible at common responsive widths', async ({ page }) => {
  for (const width of [1536, 1440, 1366, 1280, 1180, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto('/en/');

    const metrics = await page.evaluate(() => {
      const isVisible = (element: Element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      };
      const atlasElements = [...document.querySelectorAll(
        '.network-center, .network-node, .concept-node, .relation-note',
      )].filter(isVisible);
      const atlasOverlaps: string[] = [];

      for (let firstIndex = 0; firstIndex < atlasElements.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < atlasElements.length; secondIndex += 1) {
          const first = atlasElements[firstIndex].getBoundingClientRect();
          const second = atlasElements[secondIndex].getBoundingClientRect();
          const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
          const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
          if (overlapWidth > 2 && overlapHeight > 2) {
            atlasOverlaps.push(`${atlasElements[firstIndex].className} / ${atlasElements[secondIndex].className}`);
          }
        }
      }

      const highlightItems = [...document.querySelectorAll('.issue-contents li')].filter(isVisible);
      const mobileNetworkHeading = document.querySelector('.idea-network__mobile-heading');
      const highlightOverflow = highlightItems.filter((item) => {
        const itemBox = item.getBoundingClientRect();
        const link = item.querySelector('a');
        if (!link) return false;
        const linkBox = link.getBoundingClientRect();
        return link.scrollHeight > link.clientHeight + 1 || linkBox.bottom > itemBox.bottom + 1;
      }).length;

      return {
        atlasOverlaps,
        highlightOverflow,
        highlightVisible: highlightItems.length,
        mobileNetworkHeading: mobileNetworkHeading && isVisible(mobileNetworkHeading)
          ? mobileNetworkHeading.textContent?.trim()
          : null,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(metrics.atlasOverlaps, `${width}px atlas`).toEqual([]);
    expect(metrics.highlightOverflow, `${width}px highlights`).toBe(0);
    expect(metrics.highlightVisible, `${width}px highlights visibility`).toBe(width > 1400 ? 8 : 0);
    expect(metrics.mobileNetworkHeading, `${width}px network heading`).toBe(
      width <= 900 ? 'Connections & Further Reading' : null,
    );
    expect(metrics.horizontalOverflow, `${width}px horizontal overflow`).toBe(0);
  }
});

test('editorial motion reveals representative page structures once', async ({ page }) => {
  for (const path of ['/en/', '/en/books', '/en/books/the-beauty-myth', '/en/about', '/en/search']) {
    await page.goto(path);

    const motionTargets = page.locator('main [data-motion]');
    expect(await motionTargets.count(), `${path} motion targets`).toBeGreaterThan(1);
    await expect(motionTargets.first()).toHaveAttribute('data-motion-state', 'revealed');
  }

  await page.goto('/en/about');
  const principles = page.locator('.principles > .section-heading');
  await principles.scrollIntoViewIfNeeded();
  await expect(principles).toHaveAttribute('data-motion-state', 'revealed');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.querySelector('.principles')?.scrollIntoView());
  await expect(principles).toHaveAttribute('data-motion-state', 'revealed');
});

test('editorial motion remains immediately visible when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/about');

  const targets = page.locator('main [data-motion]');
  expect(await targets.count()).toBeGreaterThan(1);
  await expect(targets.first()).toHaveAttribute('data-motion-state', 'reduced');

  const hiddenTargets = await targets.evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    return style.opacity !== '1' || style.transform !== 'none';
  }).length);
  expect(hiddenTargets).toBe(0);
});

test('issue and atlas heroes animate after client-side navigation', async ({ page }) => {
  for (const destination of [
    { href: '/en/issues', hero: '.issue-index__hero' },
    { href: '/en/topics', hero: '.topic-atlas__hero' },
  ]) {
    await page.goto('/en/');
    await page.evaluate(() => {
      const motionWindow = window as Window & {
        __motionHeroTrace?: Array<{ state: string | null; time: number }>;
      };
      motionWindow.__motionHeroTrace = [];
      const observer = new MutationObserver((records) => {
        records.forEach((record) => {
          if (!(record.target instanceof HTMLElement)) return;
          if (!record.target.matches("header[class$='__hero']")) return;
          motionWindow.__motionHeroTrace?.push({
            state: record.target.getAttribute('data-motion-state'),
            time: performance.now(),
          });
        });
        if (motionWindow.__motionHeroTrace?.some((entry) => entry.state === 'revealed')) {
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-motion-state'],
        subtree: true,
      });
    });

    const navLink = page.locator(`.editorial-nav a[href="${destination.href}"]`);
    await expect(navLink).toHaveCount(1);
    await navLink.click();
    await expect(page).toHaveURL(destination.href);
    await expect(page.locator(destination.hero)).toHaveAttribute('data-motion-state', 'revealed');
    const trace = await page.evaluate(() => {
      const motionWindow = window as Window & {
        __motionHeroTrace?: Array<{ state: string | null; time: number }>;
      };
      return motionWindow.__motionHeroTrace ?? [];
    });
    const pending = trace.find((entry) => entry.state === 'pending');
    const revealed = trace.find((entry) => entry.state === 'revealed');
    expect(pending).toBeDefined();
    expect(revealed).toBeDefined();
    expect(revealed!.time - pending!.time).toBeGreaterThanOrEqual(8);
  }
});

test('homepage uses a wide capped editorial canvas and preserves the cover artwork', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/en/');

  const shellBox = await page.locator('.issue-shell').boundingBox();
  const coverImage = page.locator('.cover-story__image img');
  const coverStyle = await coverImage.evaluate((image) => {
    if (!(image instanceof HTMLImageElement)) throw new Error('Cover image is missing');
    const style = getComputedStyle(image);
    const imageBox = image.getBoundingClientRect();
    const leadTitle = document.querySelector('.issue-lead h1');
    const lead = document.querySelector('.issue-lead');
    if (!leadTitle || !lead) throw new Error('Cover story layout is incomplete');
    const titleStyle = getComputedStyle(leadTitle);
    return {
      filter: style.filter,
      mixBlendMode: style.mixBlendMode,
      opacity: style.opacity,
      naturalRatio: image.naturalWidth / image.naturalHeight,
      renderedRatio: imageBox.width / imageBox.height,
      leadWidth: lead.getBoundingClientRect().width,
      imageWidth: imageBox.width,
      imageBottom: imageBox.bottom,
      cardBottom: document.querySelector('.cover-story')?.getBoundingClientRect().bottom,
      titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
      titleFontSize: Number.parseFloat(titleStyle.fontSize),
    };
  });
  const navItems = await page.locator('.editorial-nav a').evaluateAll((links) =>
    links.slice(0, 4).map((link) => link.getAttribute('href')),
  );
  const connectionGeometry = await page.evaluate(() => {
    const shell = document.querySelector('.issue-shell');
    const poster = document.querySelector('.cover-story img');
    const entry = document.querySelector('.network-line--entry');
    if (!shell || !poster || !entry) throw new Error('Issue connection geometry is incomplete');
    const shellBox = shell.getBoundingClientRect();
    const posterBox = poster.getBoundingClientRect();
    const renderedPosterCenter = ((posterBox.left + posterBox.width / 2 - shellBox.left) / shellBox.width) * 1200;
    const pathStart = Number(entry.getAttribute('d')?.match(/^M([\d.]+)/)?.[1]);
    return { renderedPosterCenter, pathStart };
  });

  expect(shellBox).not.toBeNull();
  expect(shellBox!.width).toBeCloseTo(1440, 0);
  expect(coverStyle.filter).toBe('none');
  expect(coverStyle.mixBlendMode).toBe('normal');
  expect(coverStyle.opacity).toBe('1');
  expect(Math.abs(coverStyle.renderedRatio - coverStyle.naturalRatio)).toBeLessThan(0.01);
  expect(coverStyle.leadWidth / coverStyle.imageWidth).toBeCloseTo(1.618, 1);
  expect(coverStyle.imageBottom).toBeCloseTo(coverStyle.cardBottom!, 0);
  await expect(page.locator('.cover-story__copy')).toHaveCount(0);
  expect(coverStyle.titleLineHeight / coverStyle.titleFontSize).toBeGreaterThanOrEqual(1.07);
  expect(Math.abs(connectionGeometry.pathStart - connectionGeometry.renderedPosterCenter)).toBeLessThan(4);
  expect(navItems).toContain('/en/');
  expect(navItems).toContain('/en/topics');
  expect(navItems).toContain('/en/issues');
  expect(navItems).toContain('/en/library');
});

test('editorial rails share one canvas while the bookshelf supports dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });

  await page.goto('/en/books');
  await expect(page.locator('.ed-shell__hero')).toHaveCSS('width', '1440px');

  await page.goto('/en/books/the-beauty-myth');
  await expect(page.locator('.book-reading__rail')).toHaveCSS('width', '1440px');

  await page.goto('/en/profile/bookmarks');
  await page.getByRole('button', { name: /theme/i }).click();
  const shelf = page.locator('.reader-surface');
  const shelfPage = page.locator('.reader-list-page');
  await expect(shelf).toHaveCSS('background-color', 'rgb(24, 23, 21)');
  await expect(shelfPage).toHaveCSS('color', 'rgb(243, 239, 231)');
  await expect(shelfPage).toHaveCSS('width', '1440px');

  const footerMetrics = await page.locator('.editorial-footer').evaluate((footer) => {
    const style = getComputedStyle(footer);
    return footer.getBoundingClientRect().width
      - Number.parseFloat(style.paddingLeft)
      - Number.parseFloat(style.paddingRight);
  });
  expect(footerMetrics).toBeCloseTo(1440, 0);
});

test('film detail aligns its poster, gives the essay room, and avoids orphan folios', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1100 });
  await page.goto('/en/films/the-substance-2024');

  const metrics = await page.evaluate(() => {
    const poster = document.querySelector('.film-poster img');
    const intro = document.querySelector('.film-intro');
    const prose = document.querySelector('.film-prose');
    if (!(poster instanceof HTMLImageElement) || !intro || !prose) {
      throw new Error('Film layout is incomplete');
    }
    const posterBox = poster.getBoundingClientRect();
    const proseBox = prose.getBoundingClientRect();
    const proseStyle = getComputedStyle(prose);
    const heading = document.querySelector('.film-section-heading');
    if (!heading) throw new Error('Film section heading is missing');
    return {
      posterTop: posterBox.top,
      introTop: intro.getBoundingClientRect().top,
      naturalRatio: poster.naturalWidth / poster.naturalHeight,
      renderedRatio: posterBox.width / posterBox.height,
      proseWidth: proseBox.width,
      headingWidth: heading.getBoundingClientRect().width,
      textAlign: proseStyle.textAlign,
      hyphens: proseStyle.hyphens,
      fontFamily: proseStyle.fontFamily,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(Math.abs(metrics.posterTop - metrics.introTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics.renderedRatio - metrics.naturalRatio)).toBeLessThan(0.01);
  expect(metrics.proseWidth).toBeGreaterThan(800);
  expect(metrics.proseWidth).toBeLessThan(900);
  expect(Math.abs(metrics.headingWidth - metrics.proseWidth)).toBeLessThanOrEqual(1);
  expect(metrics.textAlign).toBe('justify');
  expect(metrics.hyphens).toBe('auto');
  expect(metrics.fontFamily.startsWith('Georgia')).toBe(true);
  expect(metrics.overflow).toBe(0);
  await expect(page.locator('.film-poster__index')).toHaveCount(0);
  await expect(page.locator('.film-related__heading')).not.toContainText('02');
});

test('editorial serif follows the page language instead of defaulting to Simplified Chinese', async ({ page }) => {
  const cases = [
    { path: '/en/', family: 'Georgia' },
    { path: '/zh-TW/', family: 'Noto Serif TC' },
    { path: '/ja/', family: 'Noto Serif JP' },
    { path: '/fr/', family: 'Georgia' },
  ];

  for (const item of cases) {
    await page.goto(item.path);
    const family = await page.locator('.issue-lead h1').evaluate((heading) => getComputedStyle(heading).fontFamily);
    expect(family, item.path).toContain(item.family);
  }
});

test('search results follow the per-type image policy', async ({ page }) => {
  const expectations: Record<string, { ratio: number; fit: string }> = {
    book: { ratio: 3 / 4, fit: 'contain' },
    film: { ratio: 2 / 3, fit: 'contain' },
    podcast: { ratio: 1, fit: 'cover' },
    video: { ratio: 16 / 9, fit: 'cover' },
  };

  for (const [type, expected] of Object.entries(expectations)) {
    await page.goto(`/en/search?type=${type}`);
    const image = page.locator(`.search-entry--${type} img`).first();
    await expect.poll(() => image.evaluate((element) =>
      element instanceof HTMLImageElement ? element.naturalWidth : 0,
    )).toBeGreaterThan(0);
    const metrics = await image.evaluate((element) => {
      if (!(element instanceof HTMLImageElement)) throw new Error('Search image is missing');
      const box = element.getBoundingClientRect();
      return {
        renderedRatio: box.width / box.height,
        objectFit: getComputedStyle(element).objectFit,
      };
    });
    expect(metrics.renderedRatio, type).toBeCloseTo(expected.ratio, 1);
    expect(metrics.objectFit, type).toBe(expected.fit);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/search?type=podcast');
  const firstPodcastEntry = page.locator('.search-entry--podcast').first();
  await expect(firstPodcastEntry).toBeVisible();
  const podcastAlignment = await firstPodcastEntry.evaluate((entry) => {
    const cover = entry.querySelector('.search-entry__cover');
    const copy = entry.querySelector('.search-entry__copy');
    if (!(cover instanceof HTMLElement) || !(copy instanceof HTMLElement)) {
      throw new Error('Podcast search result is missing its cover or copy');
    }
    return Math.abs(cover.getBoundingClientRect().top - copy.getBoundingClientRect().top);
  });
  expect(podcastAlignment).toBeLessThanOrEqual(1);

  for (const type of ['article', 'paper']) {
    await page.goto(`/en/search?type=${type}`);
    const firstEntry = page.locator(`.search-entry--${type}`).first();
    await expect(firstEntry).toBeVisible();
    await expect(firstEntry.locator('img')).toHaveCount(0);
    await expect(firstEntry.locator('h3')).toBeVisible();
  }

  await expect(page.locator('.search-entry--lead')).toHaveCount(0);
});

test('reader can switch the editorial language', async ({ page }) => {
  await page.goto('/en/');

  await page.getByRole('button', { name: /Current language: English/ }).click();
  const zhOption = page.getByRole('link', { name: /^中文$/ });
  await expect(zhOption).toBeVisible();
  await zhOption.click();

  await expect(page).toHaveURL(/\/(?:\?locale=zh-CN)?$/);
  await expect(page.getByRole('heading', { level: 1, name: '我们真的听见彼此了吗？' })).toBeVisible();
});

test('responsive header keeps every utility reachable across its breakpoints', async ({ page }) => {
  for (const width of [1024, 1023, 768, 560, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/en/');

    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme', exact: true })).toBeVisible();
    const headerGeometry = await page.evaluate(() => {
      const wordmark = document.querySelector('.editorial-wordmark')?.getBoundingClientRect();
      const actions = document.querySelector('.editorial-actions')?.getBoundingClientRect();
      return {
        gap: wordmark && actions ? actions.left - wordmark.right : -1,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(headerGeometry.gap, `header controls overlap at ${width}px`).toBeGreaterThanOrEqual(8);
    expect(headerGeometry.overflow, `page overflows at ${width}px`).toBeLessThanOrEqual(1);

    if (width >= 1024) {
      await expect(page.locator('.editorial-nav')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Current language: English/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeHidden();
      continue;
    }

    await expect(page.locator('.editorial-nav')).toBeHidden();
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
    const languageButton = mobileNav.getByRole('button', { name: /Current language: English/ });
    await expect(languageButton).toBeVisible();
    if (width === 390) {
      await languageButton.click();
      await expect(mobileNav.getByRole('link', { name: '中文', exact: true })).toBeVisible();
    }
  }

  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'reader-1', username: 'Reader', email: 'reader@example.com', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' } }),
    });
  });
  await page.route('**/api/users/interactions', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"likes":[],"bookmarks":[]}' });
  });
  await page.setViewportSize({ width: 768, height: 844 });
  await page.goto('/en/');
  await expect(page.locator('.account-menu__button')).toBeVisible();
  await page.locator('.account-menu__button').click();
  await expect(page.locator('.account-menu__panel')).toBeVisible();
  const accountPanel = await page.locator('.account-menu__panel').boundingBox();
  expect(accountPanel).not.toBeNull();
  expect(accountPanel!.x + accountPanel!.width).toBeLessThanOrEqual(768);
});

test('reader can search the collection and open a result', async ({ page }) => {
  await page.goto('/en/search');

  const search = page.getByLabel('Search the entire collection');
  await search.fill('The Beauty Myth');
  await search.press('Enter');

  await expect(page).toHaveURL(/\/en\/search\?q=The(?:\+|%20)Beauty(?:\+|%20)Myth/);
  const result = page.getByRole('link', { name: /The Beauty Myth/ }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/en\/books\/(?:the-beauty-myth|beauty-myth-naomi-wolf)$/);
});

test('signed-out reader is prompted before personal interactions', async ({ page }) => {
  await page.goto('/en/books/the-beauty-myth');
  await expect(page.getByRole('heading', { level: 1, name: 'The Beauty Myth' })).toBeVisible();

  const likeButton = page.getByTitle('Like');
  await likeButton.scrollIntoViewIfNeeded();
  const interactionIsland = likeButton.locator('xpath=ancestor::astro-island');
  await expect.poll(() => interactionIsland.getAttribute('ssr')).toBeNull();
  await likeButton.click();
  await expect(page.getByRole('status')).toHaveText('Login to Interact');

  await page.getByRole('button', { name: 'Login' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Password' })).toBeVisible();
});

test('visible content cards batch their like count requests', async ({ page }) => {
  await page.unroute('**/api/likes/count?*');
  const batches: string[][] = [];
  await page.route('**/api/likes/count?*', async (route) => {
    const contentIds = new URL(route.request().url()).searchParams.getAll('contentIds');
    batches.push(contentIds);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ counts: Object.fromEntries(contentIds.map((contentId) => [contentId, 0])) }),
    });
  });

  await page.goto('/en/articles');
  await page.locator('.editorial-interaction-buttons').first().scrollIntoViewIfNeeded();

  await expect.poll(() => batches.some((batch) => batch.length > 1)).toBe(true);
});

test('comment load failures stay distinct from an empty discussion and can be retried', async ({ page }) => {
  await page.unroute(/\/api\/comments(?:\/|$)/);
  let attempts = 0;
  await page.route('**/api/comments/**', async (route) => {
    attempts += 1;
    await route.fulfill(attempts === 1
      ? { status: 503, contentType: 'application/json', body: '{"error":"Unavailable"}' }
      : { status: 200, contentType: 'application/json', body: '{"comments":[]}' });
  });

  await page.goto('/en/books/the-beauty-myth');
  await page.getByRole('heading', { name: "Readers' notes", exact: true }).scrollIntoViewIfNeeded();
  const retry = page.getByRole('button', { name: 'Retry', exact: true });
  const emptyState = page.locator('p.editorial-thread__state', { hasText: 'No comments yet' });
  await expect(retry).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await expect(emptyState).toHaveCount(0);

  await retry.click();
  await expect(emptyState).toBeVisible();
  expect(attempts).toBe(2);
});

test('mutation APIs reject cross-origin and signed-out requests without database writes', async ({ request }) => {
  const crossOrigin = await request.post('/api/interactions/e2e-probe', {
    headers: { Origin: 'https://example.invalid' },
    data: { content_type: 'book', interaction_type: 'like' },
  });
  expect(crossOrigin.status()).toBe(403);

  const signedOut = await request.post('/api/interactions/e2e-probe', {
    headers: { Origin: 'http://127.0.0.1:4321' },
    data: { content_type: 'book', interaction_type: 'like' },
  });
  expect(signedOut.status()).toBe(401);
});

test('privacy and moderation mutations enforce their public boundaries', async ({ request }) => {
  const crossOriginAccountDelete = await request.delete('/api/auth/account', {
    headers: { Origin: 'https://example.invalid' },
    data: { password: 'not-used' },
  });
  expect(crossOriginAccountDelete.status()).toBe(403);

  const signedOutAccountDelete = await request.delete('/api/auth/account', {
    headers: { Origin: 'http://127.0.0.1:4321' },
    data: { password: 'not-used' },
  });
  expect(signedOutAccountDelete.status()).toBe(401);

  const signedOutCommentDelete = await request.delete('/api/comments/manage/e2e-probe', {
    headers: { Origin: 'http://127.0.0.1:4321' },
  });
  expect(signedOutCommentDelete.status()).toBe(401);

  const signedOutCommentReport = await request.post('/api/comments/report/e2e-probe', {
    headers: { Origin: 'http://127.0.0.1:4321' },
    data: { reason: 'spam' },
  });
  expect(signedOutCommentReport.status()).toBe(401);

  const crossOriginUnsubscribe = await request.post('/api/unsubscribe', {
    headers: { Origin: 'https://example.invalid' },
    data: { email: 'reader@example.com' },
  });
  expect(crossOriginUnsubscribe.status()).toBe(403);

  const crossOriginSubscribe = await request.post('/api/subscribe', {
    headers: { Origin: 'https://example.invalid' },
    data: { email: 'reader@example.com' },
  });
  expect(crossOriginSubscribe.status()).toBe(403);

  const invalidUnsubscribe = await request.post('/api/unsubscribe', {
    headers: { Origin: 'http://127.0.0.1:4321' },
    data: { email: 'not-an-email' },
  });
  expect(invalidUnsubscribe.status()).toBe(400);
});

test('reader can complete newsletter unsubscribe without exposing subscription state', async ({ page }) => {
  await page.route('**/api/unsubscribe', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });

  await page.goto('/en/unsubscribe');
  await page.getByLabel('Email address').fill('reader@example.com');
  await page.getByRole('button', { name: 'Unsubscribe', exact: true }).click();

  await expect(page.getByRole('status')).toHaveText(/unsubscribe request has been processed/i);
});

test('signed-in reader can reach account deletion and comment moderation controls', async ({ page }) => {
  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'reader-1', username: 'Reader', email: 'reader@example.com', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' } }),
    });
  });
  await page.route('**/api/users/interactions', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"likes":[],"bookmarks":[]}' });
  });
  await page.route('**/api/auth/account', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });

  await page.goto('/en/profile');
  await page.getByRole('button', { name: 'Delete account', exact: true }).click();
  await page.getByLabel('Enter password to confirm').fill('correct horse battery staple');
  await expect(page.getByRole('button', { name: 'Delete permanently' })).toBeEnabled();

  await page.route('**/api/comments/book-the-beauty-myth-en', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ comments: [
        { id: 'own-comment', content: 'My response', content_id: 'book-the-beauty-myth-en', content_type: 'book', user_id: 'reader-1', likes_count: 0, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', username: 'Reader', replies: [] },
        { id: 'other-comment', content: 'Another response', content_id: 'book-the-beauty-myth-en', content_type: 'book', user_id: 'reader-2', likes_count: 0, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', username: 'Another reader', replies: [] },
      ] }),
    });
  });
  await page.route('**/api/comments/report/other-comment', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.route('**/api/comments/manage/own-comment', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });

  await page.goto('/en/books/the-beauty-myth');
  await page.getByRole('heading', { name: "Readers' notes", exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reported', exact: true })).toBeDisabled();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('My response')).toHaveCount(0);
});

test('signed-in reader can choose a paginated collection view and keep that preference', async ({ page }) => {
  const likes = Array.from({ length: 13 }, (_, index) => `book-liked-work-${index + 1}`);
  const bookmarks = [
    ...Array.from({ length: 13 }, (_, index) => `book-saved-book-${index + 1}`),
    ...Array.from({ length: 12 }, (_, index) => `film-saved-film-${index + 1}`),
    ...Array.from({ length: 3 }, (_, index) => `article-saved-article-${index + 1}`),
    ...Array.from({ length: 2 }, (_, index) => `paper-saved-paper-${index + 1}`),
    'video-saved-video-1',
    'podcast-saved-podcast-1',
  ];
  const requestedBatches: string[][] = [];

  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'reader-1', username: 'Reader', email: 'reader@example.com', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' } }),
    });
  });
  await page.route('**/api/users/interactions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ likes, bookmarks }),
    });
  });
  await page.route('https://media.femres.org/images/books/the-beauty-myth.jpg', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#d92d26"/></svg>',
    });
  });
  await page.route('**/api/content/batch', async (route) => {
    const body = route.request().postDataJSON() as { ids: string[] };
    requestedBatches.push(body.ids);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: body.ids.map((id, index) => {
          const separator = id.indexOf('-');
          const type = id.slice(0, separator);
          const slug = id.slice(separator + 1);
          return {
            id,
            title: `Saved work ${slug.match(/\d+$/)?.[0]}`,
            author: `Author ${index + 1}`,
            description: 'A considered feminist resource for the reader archive.',
            type,
            slug,
            coverImage: type === 'article' || type === 'paper' ? undefined : 'https://media.femres.org/images/books/the-beauty-myth.jpg',
            publishDate: '2026-01-01T00:00:00.000Z',
          };
        }),
      }),
    });
  });

  await page.goto('/en/profile');
  await page.locator('.account-menu__button').click();
  await expect(page.locator('.account-menu__link').filter({ hasText: 'Profile' }).locator('span')).toHaveText('45');

  await page.goto('/en/profile/bookmarks');
  await expect(page.getByRole('group', { name: 'Collection view' })).toBeVisible();
  await expect(page.locator('.reader-content-item')).toHaveCount(12);
  expect(requestedBatches[0]).toHaveLength(12);

  const collectionPages = page.getByRole('navigation', { name: 'Collection pages' });
  await expect(collectionPages.getByText('1 / 3', { exact: true })).toBeVisible();
  await collectionPages.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(collectionPages.getByText('2 / 3', { exact: true })).toBeVisible();
  await expect(page.locator('.reader-content-item')).toHaveCount(12);
  await expect(page.locator('.reader-content-item__number').first()).toHaveText('13');

  await page.getByRole('button', { name: 'Covers', exact: true }).click();
  await expect(page.locator('.reader-visual-item')).toHaveCount(12);
  await expect(page.getByRole('button', { name: 'Covers', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'By type', exact: true }).click();
  await expect(page.locator('.reader-content-groups section')).toHaveCount(6);
  await expect(page.locator('.reader-content-groups section h2')).toHaveText(editorialResourceOrder);
  const booksGroup = page.locator('.reader-content-groups section').filter({ has: page.getByRole('heading', { name: 'Books', exact: true }) });
  const filmsGroup = page.locator('.reader-content-groups section').filter({ has: page.getByRole('heading', { name: 'Films', exact: true }) });
  await expect(booksGroup.locator('li')).toHaveCount(10);
  await expect(filmsGroup.locator('li')).toHaveCount(10);
  const bookPages = booksGroup.getByRole('navigation', { name: 'Books pages' });
  await expect(bookPages.getByText('1 / 2', { exact: true })).toBeVisible();
  await bookPages.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(bookPages.getByText('2 / 2', { exact: true })).toBeVisible();
  await expect(booksGroup.locator('li')).toHaveCount(3);
  await expect(filmsGroup.locator('li')).toHaveCount(10);
  await expect(page.locator('.reader-content-load-more')).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('button', { name: 'By type', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Covers', exact: true }).click();
  await expect(page.locator('.reader-visual-item')).toHaveCount(12);
  await expect(page.locator('.reader-content-visual')).toHaveCSS('grid-template-columns', /.+ .+/);
  await expect(page.locator('.reader-visual-item img').first()).toHaveCSS('object-fit', 'contain');
  const collectionOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(collectionOverflow).toBeLessThanOrEqual(1);
});
