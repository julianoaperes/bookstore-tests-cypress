import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

import BooksApi from "../../../api/BooksApi";

When("I check the library database integrity", () => {
	cy.task("db:integrity").as("databaseIntegrity");
});

Then("the library database integrity should be valid", () => {
	cy.get("@databaseIntegrity").should((rows) => {
		expect(rows).to.deep.equal([{ integrity_check: "ok" }]);
	});
});

When("I retrieve the library database tables", () => {
	cy.task("db:tables").as("databaseTables");
});

Then("the library database should contain these tables:", (dataTable) => {
	const expectedTables = dataTable.hashes().map((row) => row.name);

	cy.get("@databaseTables").then((rows) => {
		const actualTables = rows.map((row) => row.name);

		// Allow additional tables while requiring the known schema.
		expect(actualTables).to.include.members(expectedTables);
	});
});

When("I query books with invalid database stock", () => {
	cy.task("db:invalidStock").as("invalidDatabaseStock");
});

Then("no books should have invalid database stock", () => {
	cy.get("@invalidDatabaseStock").should("deep.equal", []);
});

When("I check the library database foreign keys", () => {
	cy.task("db:foreignKeyViolations").as("databaseForeignKeyViolations");
});

Then("the library database should have no foreign key violations", () => {
	cy.get("@databaseForeignKeyViolations").should("deep.equal", []);
});

When("I retrieve book {int} from the API and database", (id) => {
	BooksApi.getBookById(id).then((response) => {
		expect(response.status, "book details HTTP status").to.equal(200);

		expect(response.body.book).to.be.an("object");

		cy.wrap(response.body.book).as("databaseComparisonApiBook");
	});

	cy.task("db:bookById", id).then((rows) => {
		expect(rows, "matching database record").to.have.length(1);

		cy.wrap(rows[0]).as("databaseComparisonDbBook");
	});
});

Then("the API book should match its database record", () => {
	cy.get("@databaseComparisonApiBook").then((apiBook) => {
		cy.get("@databaseComparisonDbBook").then((databaseBook) => {
			const fields = [
				"id",
				"title",
				"author",
				"isbn",
				"editor",
				"category",
				"total_copies",
				"available_copies",
			];

			fields.forEach((field) => {
				expect(apiBook).to.have.property(field);
				expect(databaseBook).to.have.property(field);

				expect(apiBook[field], `API/database field: ${field}`).to.equal(
					databaseBook[field],
				);
			});
		});
	});
});

When("I retrieve the API and database book totals", () => {
	BooksApi.getBooks({
		page: 1,
		limit: 1,
	}).then((response) => {
		expect(response.status).to.equal(200);

		// pagination.total represents the full catalog,
		// even though this request retrieves only one book.
		cy.wrap(response.body.pagination.total).as("databaseComparisonApiTotal");
	});

	cy.task("db:bookCount").then((rows) => {
		cy.wrap(rows[0].total).as("databaseComparisonDbTotal");
	});
});

Then("the API book total should match the database", () => {
	cy.get("@databaseComparisonApiTotal").then((apiTotal) => {
		cy.get("@databaseComparisonDbTotal").then((databaseTotal) => {
			expect(apiTotal, "API/database catalog total").to.equal(databaseTotal);
		});
	});
});
