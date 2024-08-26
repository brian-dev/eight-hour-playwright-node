const config = {
    timeout: 30000,
    workers: 4,
    use: {
        headless: false,  // Headless mode for faster execution
        viewport: { width: 1280, height: 720 },
        baseURL: 'https://www.google.com', // Set the base URL here
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } }
    ],
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
        ['allure-playwright']
    ]
};

module.exports = config;