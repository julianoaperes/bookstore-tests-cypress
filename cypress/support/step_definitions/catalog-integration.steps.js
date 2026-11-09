import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

import BooksApi from "../../../api/BooksApi";

When("I retrieve a populated category through the API", () => {
  BooksApi.getCategories().then(({ status, body }) => {
    expect(status, "categories HTTP status").to.equal(200);
    expect(body.categories).to.be.an("array");

    // Select actual API data instead of hardcoding a category name.
    const category = body.categories.find((item) => item.bookCount > 0);

    // Fail clearly if no category can support this test.
    expect(category, "category containing at least one book").to.exist;

    cy.wrap(category).as("integrationCategory");
  });
});

When("I retrieve a book from that API category", () => {
  cy.get("@integrationCategory").then((category) => {
    BooksApi.getBooks({
      category: category.name,
      page: 1,
      limit: 1,
    }).then((response) => {
      expect(response.status, "filtered books HTTP status").to.equal(200);

      expect(response.body.books).to.be.an("array").and.have.length(1);

      const book = response.body.books[0];

      expect(book.category, "filtered book category").to.equal(category.name);

      // Save both the response and selected record for later checks.
      cy.wrap(response.body).as("integrationBooksBody");
      cy.wrap(book).as("integrationBook");
    });
  });
});

Then("the filtered books total should match the selected category", () => {
  cy.get("@integrationCategory").then((category) => {
    cy.get("@integrationBooksBody").then((body) => {
      // Compare the complete matching total, not the page size.
      expect(
        body.pagination.total,
        "filtered total matches category book count",
      ).to.equal(category.bookCount);
    });
  });
});

When("I retrieve the selected book details through the API", () => {
  cy.get("@integrationBook").then((book) => {
    BooksApi.getBookById(book.id).then((response) => {
      expect(response.status, "book details HTTP status").to.equal(200);

      expect(response.body.book).to.be.an("object");

      cy.wrap(response.body.book).as("integrationBookDetails");
    });
  });
});

Then("the book details should match the catalog record", () => {
  cy.get("@integrationBook").then((catalogBook) => {
    cy.get("@integrationBookDetails").then((detailsBook) => {
      // Compare fields shared by the two endpoints.
      // Extra details-only fields are allowed.
      const sharedFields = [
        "id",
        "title",
        "author",
        "isbn",
        "editor",
        "category",
        "language",
        "publication_year",
        "pages",
        "format",
        "description",
        "cover_image",
        "total_copies",
        "available_copies",
      ];

      sharedFields.forEach((field) => {
        // Require the fields on both responses so two missing
        // values cannot accidentally pass an equality check.
        expect(catalogBook, `catalog contains ${field}`).to.have.property(
          field,
        );

        expect(detailsBook, `details contain ${field}`).to.have.property(field);

        expect(detailsBook[field], `matching book field: ${field}`).to.equal(
          catalogBook[field],
        );
      });
    });
  });
});

Then("the book details category should match the selected category", () => {
  cy.get("@integrationCategory").then((category) => {
    cy.get("@integrationBookDetails").then((book) => {
      // Complete the chain back to the original category.
      expect(book.category, "category across all three endpoints").to.equal(
        category.name,
      );
    });
  });
});
