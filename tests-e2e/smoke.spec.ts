import { test, expect } from '@playwright/test';

/**
 * Broad smoke tests: every critical public surface renders, has its H1,
 * and doesn't log a console error during initial hydration. Run on every
 * preview deploy so we catch bundle regressions before merging.
 */

const PUBLIC_ROUTES = [
  { path: '/', h1: /nieuwe bewoners|Van nieuwe bewoner/i },
  { path: '/flyers-versturen-nieuwe-bewoners', h1: /nieuwe bewoners/i },
  { path: '/blog', h1: /onze kijk op/i },
  { path: '/login', h1: /welkom|account/i },
  { path: '/privacy', h1: /privacy/i },
  { path: '/voorwaarden', h1: /voorwaarden/i },
  { path: '/design', h1: /flyer|ontwerpen/i },
  { path: '/retargeting', h1: /scan|retargeting/i },
  { path: '/welkomstpakket-gemeenten', h1: /welkom|bewoners/i },
  { path: '/integraties/shopify', h1: /shopify|flyer-codes/i },
  { path: '/integraties/pos-kassa', h1: /scan|kassa/i },
];

for (const route of PUBLIC_ROUTES) {
  test(`smoke ${route.path}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const resp = await page.goto(route.path);
    expect(resp?.ok(), `HTTP ${resp?.status()} on ${route.path}`).toBe(true);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(route.h1);

    // Filter harmless hydration warnings that would otherwise dominate noise.
    const fatal = consoleErrors.filter(
      e => !/hydration|next-head-count|Download the React DevTools/i.test(e),
    );
    expect(fatal, `console errors on ${route.path}: ${fatal.join(' | ')}`).toEqual([]);
  });
}

test('health endpoint returns ok:true', async ({ request }) => {
  const resp = await request.get('/api/health');
  expect(resp.ok()).toBe(true);
  const body = (await resp.json()) as { ok: boolean };
  expect(body.ok).toBe(true);
});

test('sitemap.xml lists the landing page', async ({ request }) => {
  const resp = await request.get('/sitemap.xml');
  expect(resp.ok()).toBe(true);
  const body = await resp.text();
  expect(body).toContain('https://lokaalkabaal.agency/');
  expect(body).toContain('<urlset');
});
