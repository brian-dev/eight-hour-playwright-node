class GoogleSearchPage {
    constructor(page) {
        this.page = page;
        this.searchInput = 'textarea[name="q"]';
    }

    async open() {
        await this.page.goto('/');
    }

    async search(query) {
        await this.page.fill(this.searchInput, query);
        await this.page.press(this.searchInput, 'Enter');
    }
}

module.exports = GoogleSearchPage;
