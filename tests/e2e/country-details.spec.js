import { test, expect } from '@playwright/test';

const BASE = '/find-country-for-phd/';

async function answerQuiz(page, { citizenship = 'eu', finance = 'salary', duration = 'any', lifestyle = 'wlb' } = {}) {
  await page.goto(BASE);
  await page.locator('.nav-link[data-tab="quiz"]').click();
  await page.locator('#start-quiz-btn').click();
  for (const [name, value] of [['citizenship', citizenship], ['finance', finance], ['duration', duration], ['lifestyle', lifestyle]]) {
    await page.locator(`input[name="q-${name}"][value="${value}"]`).click();
    await page.locator('#next-step-btn').click();
  }
  await expect(page.locator('#matches-output-list')).toBeVisible();
  return page.locator('#matches-output-list .result-item');
}

test.describe('PhD Country Match Platform E2E Tests', () => {
  test('should load the homepage and display all countries', async ({ page }) => {
    await page.goto(BASE);

    // Check that country explorer has cards
    const cards = page.locator('.country-card');
    await expect(cards).toHaveCount(30);
  });

  test('should filter countries when searching', async ({ page }) => {
    await page.goto(BASE);
    const searchInput = page.locator('#explorer-search');
    await searchInput.fill('germany');

    // Cards visible should be filtered
    const visibleCards = page.locator('.grid-item-wrapper:visible');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first().locator('.country-name')).toHaveText('Germany');
  });

  test('should filter countries by price level', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#filter-price').selectOption('expensive');
    const visible = page.locator('.grid-item-wrapper:visible');
    const count = await visible.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(30);
    await expect(page.locator('.grid-item-wrapper:visible[data-price="Low"]')).toHaveCount(0);
  });

  test('should navigate to country details page on card click', async ({ page }) => {
    await page.goto(BASE);

    // Click on the first card (Austria)
    const austriaCard = page.locator('.country-card[data-country-id="austria"]').first();
    await austriaCard.click();

    // Verify URL changes to the dynamic country page
    await expect(page).toHaveURL(/\/countries\/austria\/?$/);

    // Verify details content is loaded
    const heading = page.locator('h1.country-title');
    await expect(heading).toHaveText('PhD in Austria');

    // Verify system overview contains content
    const overview = page.locator('.overview-text');
    await expect(overview).not.toBeEmpty();

    // Verify Back button works
    const backBtn = page.locator('.back-link');
    await backBtn.click();
    await expect(page).toHaveURL(/\/find-country-for-phd\/?$/);
  });

  test('country page lists the source portals from the dataset', async ({ page }) => {
    await page.goto(`${BASE}countries/germany/`);
    const portals = page.locator('.portal-link-item');
    await expect(portals).toHaveCount(2);
    await expect(portals.first()).toHaveAttribute('href', 'https://www.research-in-germany.org');
    await expect(page.getByText('Up to 18 months to stay and look for work')).toBeVisible();
  });

  test('country page cites its sources and explains the pay figure', async ({ page }) => {
    await page.goto(`${BASE}countries/germany/`);
    const sources = page.locator('.source-list li');
    expect(await sources.count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('.source-list a[href*="oeffentlichen-dienst.de"]')).toHaveCount(1);
    await expect(page.getByText(/65% of TV-L E13 step 1/)).toBeVisible();
    await expect(page.getByText(/Gross minus about \d+(\.\d)?% income tax/)).toBeVisible();
    await expect(page.getByText('€992–€1,500 / month')).toBeVisible();
    await expect(page.locator('.source-list a[href*="lmu.de"]')).toHaveCount(1);
  });

  test('country page shows how pay changes by year and contract', async ({ page }) => {
    await page.goto(`${BASE}countries/germany/`);
    const rows = page.locator('.pay-table tbody tr');
    await expect(rows).toHaveCount(6);
    await expect(page.locator('.pay-table')).toContainText('100% contract, year 1');
    await expect(page.locator('.pay-table')).toContainText('EUR 4,759.37 / month');
    await page.goto(`${BASE}countries/netherlands/`);
    await expect(page.locator('.pay-table tbody tr')).toHaveCount(4);
    await expect(page.locator('.pay-table')).toContainText('Year 4 (P3)');
  });

  test('country pages fit a phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const id of ['germany', 'netherlands', 'united_kingdom']) {
      await page.goto(`${BASE}countries/${id}/`);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, id).toBeLessThanOrEqual(375);
    }
  });

  test('budget calculator can switch pay level', async ({ page }) => {
    await page.goto(`${BASE}#calculator`);
    await page.locator('#calc-country-select').selectOption('netherlands');
    const before = await page.locator('#input-stipend').inputValue();
    await page.locator('#calc-pay-step').selectOption({ index: 3 });
    const after = await page.locator('#input-stipend').inputValue();
    expect(Number(after)).toBeGreaterThan(Number(before));
  });

  test('UK page does not promise EU free movement', async ({ page }) => {
    await page.goto(`${BASE}countries/united_kingdom/`);
    await expect(page.getByText(/Student visa required \(no EU free movement\)/)).toBeVisible();
    await expect(page.getByText('Not needed (free movement)')).toHaveCount(0);
  });

  test('header navigation works from a country page', async ({ page }) => {
    await page.goto(`${BASE}countries/poland/`);
    await page.locator('.nav-link[data-tab="quiz"]').click();
    await expect(page).toHaveURL(/\/find-country-for-phd\/#quiz$/);
    await expect(page.locator('#quiz-tab')).toBeVisible();
    await expect(page.locator('#start-quiz-btn')).toBeVisible();
  });

  test('tabs can be deep-linked', async ({ page }) => {
    await page.goto(`${BASE}#comparison`);
    await expect(page.locator('#comparison-tab')).toBeVisible();
    await expect(page.locator('.nav-link[data-tab="comparison"]')).toHaveAttribute('aria-current', 'page');
  });

  test('should run the quiz and show results', async ({ page }) => {
    const results = await answerQuiz(page, { duration: 'fast' });
    const firstMatch = results.first();
    await expect(firstMatch).toBeVisible();

    // Click View details of the first match
    await firstMatch.locator('a').click();

    // Check that we successfully navigated to that country's details page
    await expect(page).toHaveURL(/\/countries\/[a-z_]+\/?$/);
  });

  test('quiz asks for an answer instead of skipping ahead', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.nav-link[data-tab="quiz"]').click();
    await page.locator('#start-quiz-btn').click();
    await page.locator('#next-step-btn').click();
    await expect(page.locator('#quiz-error')).toBeVisible();
    await expect(page.locator('#current-step-num')).toHaveText('1');
  });

  test('quiz answers actually change the ranking', async ({ page }) => {
    const topName = async (answers) => (await answerQuiz(page, answers)).first().locator('.result-country-name').innerText();
    const sunny = await topName({ finance: 'living', lifestyle: 'climate' });
    const savings = await topName({ finance: 'living', lifestyle: 'savings' });
    expect(sunny).not.toBe(savings);
  });

  test('pages load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto(BASE);
    for (const tab of ['quiz', 'calculator', 'comparison']) {
      await page.locator(`.nav-link[data-tab="${tab}"]`).click();
    }
    await page.goto(`${BASE}countries/spain/`);
    expect(errors).toEqual([]);
  });
});
