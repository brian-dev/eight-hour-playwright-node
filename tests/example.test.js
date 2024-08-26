const GoogleSearchPage = require('../pageObjects/GoogleSearchPage');
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('Google Search with Page Object', async ({ page }) => {
    const google = new GoogleSearchPage(page);
    await google.search('Playwright');
    const results = await page.waitForSelector('#search');
    expect(results).toBeTruthy();
});
