class CatalogPage {
	// Keep selectors together so HTML changes can be handled
	// in this file without rewriting the scenarios.
	selectors = {
		search: "#search-input",
		category: "#category-filter",
		publisher: "#editor-filter",
		availability: "#availability-filter",

		filterStatus: "#filter-status",
		clearFilters: "#clear-filters",
		resultsCount: "#results-count",

		bookList: "#book-list",
		cards: "#book-list .card",
		titles: "#book-list .card-title a",

		gridButton: "#view-grid",
		listButton: "#view-list",
		pagination: "#pagination",

		// Scope the basket link to the header to avoid footer links.
		basketLink: 'header a[href="/basket.html"]',
	};

	// Navigation

	visitCatalogPage(category) {
		// Encode accented characters correctly when testing a category
		// supplied through the URL, such as "História".
		const query =
			category === undefined ? "" : `?category=${encodeURIComponent(category)}`;

		cy.visit(`http://localhost:3000/catalog.html${query}`);

		// Check the page identity before interacting with its controls.
		cy.location("pathname").should("eq", "/catalog.html");

		cy.contains("h2", "Conheça Nosso Acervo").should("be.visible");

		cy.get(this.selectors.search).should("be.visible");
	}

	reload() {
		// Reload through the browser to check whether basket state
		// survives a new page load.
		cy.reload();

		cy.get(this.selectors.search).should("be.visible");
	}

	// Element helpers

	bookCard(title) {
		// Match the complete title rather than a substring.
		// This avoids selecting the wrong card when titles overlap.
		return cy.get(this.selectors.cards).filter((index, card) => {
			const actualTitle = Cypress.$(card).find(".card-title a").text().trim();

			return actualTitle === title;
		});
	}

	// Search and filter actions

	search(value) {
		// Clear the old query so the new search replaces it completely.
		cy.get(this.selectors.search).clear();

		// Cypress cannot type an empty string.
		// An empty value means the test only clears the search.
		if (value !== "") {
			cy.get(this.selectors.search).type(value, {
				// Enter the query literally, including special characters.
				parseSpecialCharSequences: false,
			});
		}

		// No fixed wait is needed here.
		// The result assertions retry while the search updates.
	}

	selectCategory(category) {
		// The option values contain the category name without
		// the count shown in the visible label.
		cy.get(this.selectors.category).select(category);
	}

	selectPublisher(publisher) {
		// The application's publisher dropdown uses the ID editor-filter.
		cy.get(this.selectors.publisher).select(publisher);
	}

	selectAvailability(label) {
		// Select by the visible Portuguese option label.
		cy.get(this.selectors.availability).select(label);
	}

	clearFilters() {
		// Use the application's reset button to exercise the same
		// behavior available to a real visitor.
		cy.get(this.selectors.clearFilters).should("be.visible").click();
	}

	// Pagination and display actions

	openPage(page) {
		// Match the entire page number so page 1 cannot match page 10.
		cy.get(this.selectors.pagination)
			.contains("a", new RegExp(`^\\s*${page}\\s*$`))
			.scrollIntoView()
			.click();
	}

	switchView(view) {
		// Reject misspelled view names with a readable test failure.
		expect(["grid", "list"], "supported catalog views").to.include(view);

		const selector =
			view === "grid" ? this.selectors.gridButton : this.selectors.listButton;

		cy.get(selector).should("be.visible").click();
	}

	// Book actions

	openBookTitle(title) {
		// Select the exact card before clicking its title.
		this.bookCard(title).should("have.length", 1).find(".card-title a").click();
	}

	openBookDetails(title) {
		// The button text changes between grid and list views.
		// Its shared CSS class works in both layouts.
		this.bookCard(title).should("have.length", 1).find(".view-details").click();
	}

	addBookToBasket(title) {
		// Scope the action to one book so another card's button
		// cannot accidentally receive the click.
		this.bookCard(title)
			.should("have.length", 1)
			.find(".add-to-cart")
			.should("be.enabled")
			.click();

		// Basket-count assertions verify the resulting state separately.
		// This avoids depending on a short-lived success notification.
	}

	openBasket() {
		// Follow the actual navigation link instead of visiting the
		// basket URL directly.
		cy.get(this.selectors.basketLink).click();
	}

	// Catalog assertions

	assertControls() {
		// Verify all search, filter, and display controls are available.
		const controls = [
			this.selectors.search,
			this.selectors.category,
			this.selectors.publisher,
			this.selectors.availability,
			this.selectors.gridButton,
			this.selectors.listButton,
		];

		controls.forEach((selector) => {
			cy.get(selector).should("be.visible");
		});
	}

	assertResultsCount(displayed, total) {
		// Match the summary text while allowing case/whitespace differences.
		const expected = new RegExp(
			`Exibindo\\s+${displayed}\\s+de\\s+${total}\\s+livros`,
			"i",
		);

		cy.get(this.selectors.resultsCount)
			.invoke("text")
			.should("match", expected);

		// Cross-check the counter against the rendered cards.
		cy.get(this.selectors.cards).should("have.length", displayed);
	}

	assertExactBooks(expectedTitles) {
		// Compare the entire visible result set, not just one match.
		// Extra unrelated books will cause this assertion to fail.
		cy.get(this.selectors.titles).should(($links) => {
			const actualTitles = [...$links].map((link) => link.textContent.trim());

			// Sorting copies makes the assertion independent of ordering.
			expect([...actualTitles].sort(), "displayed book titles").to.deep.equal(
				[...expectedTitles].sort(),
			);
		});
	}

	assertBookVisible(title) {
		// Verify both uniqueness and visibility of the matching card.
		this.bookCard(title).should("have.length", 1).and("be.visible");
	}

	assertBookAbsent(title) {
		// Query all current titles inside a retryable assertion.
		cy.get(this.selectors.bookList).should(($list) => {
			const titles = [...$list[0].querySelectorAll(".card-title a")].map(
				(link) => link.textContent.trim(),
			);

			expect(titles, "displayed titles").not.to.include(title);
		});
	}

	assertNoBooks() {
		// Check the message shown by the application.
		// Its source text may be visually transformed to uppercase.
		cy.get(this.selectors.resultsCount).should(
			"contain.text",
			"Nenhum livro encontrado",
		);

		// Confirm the empty state contains no leftover book cards.
		cy.get(this.selectors.bookList).find(".card").should("have.length", 0);
	}

	assertSelectedCategory(category) {
		// Verify the selected value independently of the result cards.
		cy.get(this.selectors.category).should("have.value", category);
	}

	assertSelectedPublisher(publisher) {
		cy.get(this.selectors.publisher).should("have.value", publisher);
	}

	assertEveryBookCategory(category) {
		// These category scenarios use the default grid layout.
		// Each category paragraph contains the fa-tag icon.
		cy.get(this.selectors.cards).should(($cards) => {
			expect($cards.length, "matching books").to.be.greaterThan(0);

			[...$cards].forEach((card) => {
				const categoryText = card
					.querySelector(".fa-tag")
					?.closest("p")
					?.textContent.trim();

				expect(categoryText, "book category").to.equal(category);
			});
		});
	}

	assertAvailableBooks() {
		// Check every displayed card rather than only the first one.
		cy.get(this.selectors.cards).should(($cards) => {
			expect($cards.length, "available books").to.be.greaterThan(0);

			[...$cards].forEach((card) => {
				const badge = card.querySelector(".badge.bg-success");
				const quantity = Number.parseInt(badge?.textContent, 10);
				const addButton = card.querySelector(".add-to-cart");

				expect(quantity, "available copies").to.be.greaterThan(0);
				expect(addButton, "add-to-basket button").not.to.equal(null);
				expect(addButton.disabled, "book can be added").to.equal(false);
			});
		});
	}

	assertFiltersReset() {
		// Check each control so a partially working reset is detected.
		cy.get(this.selectors.search).should("have.value", "");
		cy.get(this.selectors.category).should("have.value", "");
		cy.get(this.selectors.publisher).should("have.value", "");
		cy.get(this.selectors.availability).should("have.value", "");

		// The active-filter status should disappear after the reset.
		cy.get(this.selectors.filterStatus).should("not.be.visible");
	}

	assertUrlCategory(category) {
		// URLSearchParams decodes accented category names correctly.
		cy.location("search").should((search) => {
			const parameters = new URLSearchParams(search);

			expect(parameters.get("category"), "category URL parameter").to.equal(
				category,
			);
		});
	}

	assertActivePage(page) {
		// Bootstrap marks the selected pagination item with "active".
		cy.get(this.selectors.pagination)
			.find(".active")
			.should(($item) => {
				expect($item.text().trim(), "active catalog page").to.equal(
					String(page),
				);
			});
	}

	assertView(view) {
		const activeButton =
			view === "grid" ? this.selectors.gridButton : this.selectors.listButton;

		const inactiveButton =
			view === "grid" ? this.selectors.listButton : this.selectors.gridButton;

		// Verify that the selected mode is reflected in the controls.
		cy.get(activeButton).should("have.class", "active");
		cy.get(inactiveButton).should("not.have.class", "active");

		// Also verify that the card layout actually changes.
		// List cards contain an internal Bootstrap row.
		cy.get(this.selectors.cards)
			.first()
			.within(() => {
				if (view === "list") {
					cy.get(".row.g-0").should("exist");
				} else {
					cy.get("img.card-img-top").should("exist");
				}
			});
	}

	assertBookCards() {
		// Check titles, author/category information, descriptions,
		// covers, and actions on each first-page grid card.
		cy.get(this.selectors.cards)
			.should("have.length.greaterThan", 0)
			.each(($card) => {
				cy.wrap($card).within(() => {
					cy.get(".card-title a")
						.should("be.visible")
						.and("have.attr", "href")
						.and("include", "/book-details.html?id=");

					cy.get(".fa-user").parent().invoke("text").should("match", /\S/);

					cy.get(".fa-tag").parent().invoke("text").should("match", /\S/);

					cy.get("p.card-text.small").invoke("text").should("match", /\S/);

					// complete + naturalWidth detects images that failed to load.
					cy.get("img").should(($image) => {
						expect($image[0].alt, "cover description").not.to.equal("");
						expect($image[0].complete, "cover finished loading").to.equal(true);
						expect(
							$image[0].naturalWidth,
							"cover loaded successfully",
						).to.be.greaterThan(0);
					});

					cy.get(".add-to-cart").should("be.visible");
					cy.get(".view-details").should("be.visible");
				});
			});
	}

	// Destination assertions

	assertBookDetails(title, id) {
		// Verify the destination and book identity after navigation.
		cy.location("pathname").should("eq", "/book-details.html");

		cy.location("search").should((search) => {
			expect(new URLSearchParams(search).get("id"), "book ID").to.equal(id);
		});

		cy.get("main h1").should("have.text", title);
	}

	assertBasketCount(expectedCount) {
		// The header link contains the label plus its numeric badge.
		cy.get(this.selectors.basketLink).should(($link) => {
			const numbers = $link.text().match(/\d+/g);
			const actualCount = Number(numbers?.at(-1));

			expect(actualCount, "basket book count").to.equal(expectedCount);
		});
	}

	assertBookInBasket(title) {
		// Verify that adding a book created an actual basket entry,
		// not merely a changed header counter.
		cy.location("pathname").should("eq", "/basket.html");

		cy.get("main").should("be.visible");
		cy.contains("main", title).should("be.visible");
	}
}

export default new CatalogPage();
