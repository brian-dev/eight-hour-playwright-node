const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    globalSetup: require.resolve('./global-setup'),
    globalTeardown: require.resolve('./global-teardown'),
    timeout: 30000,
    // workers: 4,
    use: {
        headless: false, // Headless mode for faster execution
        viewport: { width: 1280, height: 720 },
        baseURL: 'https://www.google.com', // Base URL for tests
        trace: 'on-first-retry', // Capture trace for first retry
        screenshot: 'only-on-failure', // Capture screenshots on failure
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        // Uncomment the following lines to enable testing on additional browsers
        // { name: 'firefox', use: { browserName: 'firefox' } },
        // { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    reporter: [
        ['list'], // Console reporter
        ['html', { open: 'never' }], // HTML report configuration
        ['allure-playwright'], // Allure reporter
    ],
});

