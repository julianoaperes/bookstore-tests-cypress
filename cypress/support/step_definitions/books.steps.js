import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

import BooksApi from "../../../api/BooksApi";

When("I request books with these query parameters:", (dataTable) => {
	// Convert the two-column Gherkin table into a query-string object.
	const query = dataTable.rowsHash();

	BooksApi.getBooks(query).as("booksResponse");
});

Then("the books API status should be {int}", (status) => {
	cy.get("@booksResponse").its("status").should("eq", status);
});

Then("the books API should return JSON", () => {
	cy.get("@booksResponse").then((response) => {
		expect(response.headers["content-type"]).to.include("application/json");
	});
});

Then("the books API response should have a valid structure", () => {
	cy.get("@booksResponse").then((response) => {
		BooksApi.assertResponseStructure(response.body);
	});
});

Then("the books API pagination should be consistent", () => {
	cy.get("@booksResponse").then((response) => {
		BooksApi.assertPagination(response.body);
	});
});

Then("the books API should return {int} books", (count) => {
	cy.get("@booksResponse").its("body.books").should("have.length", count);
});

Then("the books API should return exactly these titles:", (dataTable) => {
	const expectedTitles = dataTable.hashes().map((row) => row.title);

	cy.get("@booksResponse").then((response) => {
		BooksApi.assertTitles(response.body.books, expectedTitles);
	});
});

Then("the books API should return an empty collection", () => {
	cy.get("@booksResponse").then((response) => {
		expect(response.body.books).to.deep.equal([]);
		expect(response.body.pagination.total).to.equal(0);
		expect(response.body.pagination.showing).to.equal(0);
	});
});

Then(
	"every returned book should have {string} equal to {string}",
	(property, expectedValue) => {
		cy.get("@booksResponse").then((response) => {
			BooksApi.assertBookProperty(response.body.books, property, expectedValue);
		});
	},
);

Then("every returned book should have available copies", () => {
	cy.get("@booksResponse").then((response) => {
		BooksApi.assertAvailableBooks(response.body.books);
	});
});

When("I save the returned book IDs", () => {
	cy.get("@booksResponse").then((response) => {
		const ids = response.body.books.map((book) => book.id);

		cy.wrap(ids).as("savedBookIds");
	});
});

Then("the books API current page should be {int}", (page) => {
	cy.get("@booksResponse")
		.its("body.pagination.currentPage")
		.should("eq", page);
});

Then("the returned books should not repeat the saved IDs", () => {
	cy.get("@savedBookIds").then((savedIds) => {
		cy.get("@booksResponse").then((response) => {
			const currentIds = response.body.books.map((book) => book.id);

			const repeatedIds = currentIds.filter((id) => savedIds.includes(id));

			expect(repeatedIds, "IDs repeated across pages").to.deep.equal([]);
		});
	});
});
