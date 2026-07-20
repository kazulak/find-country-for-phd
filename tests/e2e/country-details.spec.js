import { test, expect } from '@playwright/test';

test.describe('PhD Country Match Platform E2E Tests', () => {
  test('should load the homepage and display all countries', async ({ page }) => {
    await page.goto('/find-country-for-phd/');
    
    // Check that country explorer has cards
    const cards = page.locator('.country-card');
    await expect(cards).toHaveCount(30);
  });

  test('should filter countries when searching', async ({ page }) => {
    await page.goto('/find-country-for-phd/');
    const searchInput = page.locator('#explorer-search');
    await searchInput.fill('germany');
    
    // Cards visible should be filtered
    const visibleCards = page.locator('.grid-item-wrapper:visible');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first().locator('.country-name')).toHaveText('Germany');
  });

  test('should navigate to country details page on card click', async ({ page }) => {
    await page.goto('/find-country-for-phd/');
    
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

  test('should run the quiz and show results', async ({ page }) => {
    await page.goto('/find-country-for-phd/');
    
    // Switch to quiz tab
    await page.locator('.nav-link[data-tab="quiz"]').click();

    // Start Quiz
    const startQuizBtn = page.locator('#start-quiz-btn');
    await startQuizBtn.click();

    // Step 1: Citizenship
    await page.locator('input[name="q-citizenship"][value="eu"]').click();
    await page.locator('#next-step-btn').click();

    // Step 2: Financial
    await page.locator('input[name="q-finance"][value="salary"]').click();
    await page.locator('#next-step-btn').click();

    // Step 3: Language
    await page.locator('input[name="q-language"][value="english"]').click();
    await page.locator('#next-step-btn').click();

    // Step 4: Structure
    await page.locator('input[name="q-structure"][value="structured"]').click();
    await page.locator('#next-step-btn').click();

    // Step 5: Lifestyle
    await page.locator('input[name="q-lifestyle"][value="wlb"]').click();
    await page.locator('#next-step-btn').click(); // Calculate matches

    // Verify results show up
    const resultsList = page.locator('#matches-output-list');
    await expect(resultsList).toBeVisible();
    
    const firstMatch = resultsList.locator('.result-item').first();
    await expect(firstMatch).toBeVisible();
    
    // Click View details of the first match
    const firstMatchDetailsLink = firstMatch.locator('a');
    await firstMatchDetailsLink.click();
    
    // Check that we successfully navigated to that country's details page
    await expect(page).toHaveURL(/\/countries\/[a-z_]+\/?$/);
  });
});
