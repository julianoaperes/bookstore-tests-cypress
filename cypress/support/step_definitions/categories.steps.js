import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

import BooksApi from "../../../api/BooksApi";

When("I request the book categories", () => {
  BooksApi.getCategories().as("categoriesResponse");
});

Then("the categories API status should be {int}", (status) => {
  cy.get("@categoriesResponse").its("status").should("eq", status);
});

Then("the categories API should return JSON", () => {
  cy.get("@categoriesResponse").then(({ headers }) => {
    expect(headers["content-type"]).to.include("application/json");
  });
});

Then("the categories response should have a valid structure", () => {
  cy.get("@categoriesResponse").then(({ body }) => {
    expect(body).to.be.an("object");

    expect(body).to.have.property("categories").that.is.an("array");

    // Require records so the field checks actually run.
    expect(body.categories).not.to.be.empty;

    expect(body.total).to.be.a("number");
    expect(Number.isInteger(body.total)).to.equal(true);
    expect(body.total).to.be.at.least(0);

    body.categories.forEach((category) => {
      expect(category.name, "category name").to.be.a("string");

      expect(category.name.trim(), "nonblank category name").not.to.equal("");

      expect(category.bookCount, `${category.name}: book count`).to.be.a(
        "number",
      );

      expect(Number.isInteger(category.bookCount)).to.equal(true);

      expect(category.bookCount).to.be.at.least(0);

      expect(
        category.availableBooks,
        `${category.name}: availability quantity`,
      ).to.be.a("number");

      expect(Number.isInteger(category.availableBooks)).to.equal(true);

      expect(category.availableBooks).to.be.at.least(0);
    });
  });
});

Then("the category names should be unique", () => {
  cy.get("@categoriesResponse").then(({ body }) => {
    const names = body.categories.map((category) =>
      category.name.trim().toLocaleLowerCase("pt-BR"),
    );

    expect(new Set(names).size, "unique category names").to.equal(names.length);
  });
});

Then("the categories total should match the collection size", () => {
  cy.get("@categoriesResponse").then(({ body }) => {
    expect(body.total, "category total").to.equal(body.categories.length);
  });
});

Then("the categories should include these names:", (dataTable) => {
  const expectedNames = dataTable.hashes().map((row) => row.name);

  cy.get("@categoriesResponse").then(({ body }) => {
    const actualNames = body.categories.map((category) => category.name);

    expect(actualNames).to.include.members(expectedNames);
  });
});

Then("the categories should not include {string}", (name) => {
  cy.get("@categoriesResponse").then(({ body }) => {
    const names = body.categories.map((category) => category.name);

    expect(names).not.to.include(name);
  });
});

Then("each category book count should match the books API", () => {
  cy.get("@categoriesResponse").then(({ body }) => {
    expect(body.categories, "categories to compare").not.to.be.empty;

    // Cypress queues these requests sequentially.
    cy.wrap(body.categories).each((category) => {
      // Only one book is needed because pagination.total contains
      // the complete number of matching books.
      return BooksApi.getBooks({
        category: category.name,
        page: 1,
        limit: 1,
      }).then((response) => {
        expect(response.status, `${category.name}: HTTP status`).to.equal(200);

        expect(
          response.body.pagination.total,
          `${category.name}: matching book count`,
        ).to.equal(category.bookCount);
      });
    });
  });
});

Then("the sum of category book counts should match the catalog total", () => {
  cy.get("@categoriesResponse").then(({ body }) => {
    const categoryTotal = body.categories.reduce(
      (sum, category) => sum + category.bookCount,
      0,
    );

    BooksApi.getBooks({
      page: 1,
      limit: 1,
    }).then((response) => {
      expect(response.status).to.equal(200);

      // This application assigns one category to each book.
      // Compare totals without hardcoding the current 23 books.
      expect(categoryTotal, "books across all categories").to.equal(
        response.body.pagination.total,
      );
    });
  });
});
