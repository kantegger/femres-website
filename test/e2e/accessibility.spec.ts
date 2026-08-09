import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { path: '/en/', name: 'English current issue' },
  { path: '/en/search', name: 'English search' },
  { path: '/en/books/the-beauty-myth', name: 'English book detail' },
];

for (const route of routes) {
  test(`${route.name} has no serious accessibility violations`, async ({ page }) => {
    await page.route('**/api/auth/me', (request) => request.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await page.route('**/api/likes/count?*', (request) => request.fulfill({ status: 200, contentType: 'application/json', body: '{"counts":{}}' }));
    await page.route(/\/api\/comments(?:\/|$)/, (request) => request.fulfill({ status: 200, contentType: 'application/json', body: '{"comments":[]}' }));

    await page.goto(route.path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const seriousViolations = results.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(seriousViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.slice(0, 12).map((node) => node.target),
    }))).toEqual([]);
  });
}
