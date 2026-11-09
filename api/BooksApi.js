class BooksApi {
	// Use the same server that supplies data to your catalog page.
	// Keeping the URL here makes changing environments easier.
	baseUrl = "http://localhost:3000";

	getBooks(query = {}) {
		// Return the Cypress chain so step definitions can save the
		// response with .as() and make assertions afterward.
		return cy.request({
			method: "GET",

			url: `${this.baseUrl}/api/books`,

			// Cypress builds and encodes the query string.
			// Accented values such as "História" are encoded automatically.
			qs: query,

			// Tell the server that the client expects JSON.
			headers: {
				Accept: "application/json",
			},

			// Keep error responses available for explicit assertions.
			// Each scenario checks its expected HTTP status separately.
			failOnStatusCode: false,
		});
	}

	assertResponseStructure(body) {
		// Verify the response envelope before inspecting its contents.
		expect(body, "response body").to.be.an("object");

		expect(body).to.have.property("books").that.is.an("array");
		expect(body).to.have.property("pagination").that.is.an("object");
		expect(body).to.have.property("filters").that.is.an("object");

		// Require records here so this test cannot pass without
		// actually validating at least one book.
		expect(body.books, "books to validate").not.to.be.empty;

		body.books.forEach((book) => {
			// Identify each record and check fields used by the catalog.
			expect(book.id, "book ID").to.be.a("number");
			expect(Number.isInteger(book.id), "integer book ID").to.equal(true);

			expect(book.id, "positive book ID").to.be.greaterThan(0);

			expect(book.title, "book title").to.be.a("string").and.not.be.empty;

			expect(book.author, "book author").to.be.a("string").and.not.be.empty;

			expect(book.category, "book category").to.be.a("string").and.not.be.empty;

			expect(book.isbn, "book ISBN").to.be.a("string");
			expect(book.editor, "book publisher").to.be.a("string");

			// Validate stock relationships as well as data types.
			// An available quantity must never exceed the total stock.
			expect(book.total_copies, "total copies").to.be.a("number");
			expect(book.available_copies, "available copies").to.be.a("number");

			expect(Number.isInteger(book.total_copies)).to.equal(true);

			expect(Number.isInteger(book.available_copies)).to.equal(true);

			expect(book.total_copies).to.be.at.least(0);
			expect(book.available_copies).to.be.at.least(0);

			expect(book.available_copies).to.be.at.most(book.total_copies);
		});

		// A page should not contain the same book more than once.
		const ids = body.books.map((book) => book.id);

		expect(new Set(ids).size, "unique book IDs").to.equal(ids.length);
	}

	assertPagination(body) {
		const { books, pagination } = body;

		// Validate numeric metadata before calculating expectations.
		const integerFields = [
			"total",
			"limit",
			"offset",
			"currentPage",
			"totalPages",
			"showing",
		];

		integerFields.forEach((field) => {
			expect(pagination[field], `pagination.${field}`).to.be.a("number");

			expect(
				Number.isInteger(pagination[field]),
				`pagination.${field} is an integer`,
			).to.equal(true);
		});

		expect(pagination.total).to.be.at.least(0);
		expect(pagination.limit).to.be.greaterThan(0);
		expect(pagination.currentPage).to.be.at.least(1);
		expect(pagination.offset).to.be.at.least(0);

		// These scenarios request pages within the available results.
		// The expected offset follows page-based pagination.
		const expectedOffset = (pagination.currentPage - 1) * pagination.limit;

		expect(pagination.offset, "page offset").to.equal(expectedOffset);

		const expectedPages = Math.ceil(pagination.total / pagination.limit);

		expect(pagination.totalPages, "total pages").to.equal(expectedPages);

		// Calculate the number of records expected on this page.
		// The final page may contain fewer records than the limit.
		const expectedBookCount = Math.min(
			pagination.limit,
			Math.max(0, pagination.total - pagination.offset),
		);

		expect(books.length, "records on this page").to.equal(expectedBookCount);

		// The observed API uses "showing" for the returned record count.
		expect(pagination.showing, "showing count").to.equal(books.length);

		// Navigation flags must agree with the pagination metadata.
		expect(pagination.hasPrev, "previous page flag").to.equal(
			pagination.currentPage > 1,
		);

		expect(pagination.hasNext, "next page flag").to.equal(
			pagination.currentPage < pagination.totalPages,
		);
	}

	assertTitles(books, expectedTitles) {
		// Compare the complete result set.
		// This catches both missing books and extra unrelated books.
		const actualTitles = books.map((book) => book.title);

		// Sort copies because these scenarios test search results,
		// rather than the order in which the API returns them.
		expect([...actualTitles].sort(), "returned titles").to.deep.equal(
			[...expectedTitles].sort(),
		);
	}

	assertBookProperty(books, property, expectedValue) {
		// Prevent an empty array from passing an "every book" check.
		expect(books, "filtered books").not.to.be.empty;

		books.forEach((book) => {
			expect(book[property], `${book.title}: ${property}`).to.equal(
				expectedValue,
			);
		});
	}

	assertAvailableBooks(books) {
		// Require actual results before validating availability.
		expect(books, "available books").not.to.be.empty;

		books.forEach((book) => {
			expect(book.available_copies, `${book.title}: available copies`)
				.to.be.a("number")
				.and.be.greaterThan(0);
		});
	}
	getBookById(id) {
		// Encode the ID so it remains a single URL path segment.
		// This also allows negative tests to send nonnumeric values.
		const encodedId = encodeURIComponent(String(id));

		// Return the response so steps can inspect its status and body.
		return cy.request({
			method: "GET",
			url: `${this.baseUrl}/api/books/${encodedId}`,

			headers: {
				Accept: "application/json",
			},

			// Allow expected error responses, such as 400 and 404,
			// to reach the assertions instead of stopping the request.
			failOnStatusCode: false,
		});
	}
	getCategories() {
		// Retrieve the categories used by the catalog dropdown.
		return cy.request({
			method: "GET",
			url: `${this.baseUrl}/api/books/categories`,

			headers: {
				Accept: "application/json",
			},

			// Let the scenario explicitly verify the HTTP status.
			failOnStatusCode: false,
		});
	}
}

export default new BooksApi();
