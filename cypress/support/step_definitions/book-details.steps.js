import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

import BooksApi from "../../../api/BooksApi";

When("I request book details for ID {string}", (id) => {
  BooksApi.getBookById(id).as("bookDetailsResponse");
});

Then("the book details API status should be {int}", (status) => {
  cy.get("@bookDetailsResponse").its("status").should("eq", status);
});

Then("the book details API should return JSON", () => {
  cy.get("@bookDetailsResponse").then((response) => {
    expect(response.headers["content-type"]).to.include("application/json");
  });
});

Then(
  "the returned book should have ID {int} and title {string}",
  (id, title) => {
    cy.get("@bookDetailsResponse").then(({ body }) => {
      expect(body.book.id).to.equal(id);
      expect(body.book.title).to.equal(title);
    });
  },
);

Then("the book details response should have a valid structure", () => {
  cy.get("@bookDetailsResponse").then(({ body }) => {
    expect(body).to.be.an("object");

    expect(body).to.have.property("book").that.is.an("object");
    expect(body).to.have.property("availability").that.is.an("object");
    expect(body).to.have.property("statistics").that.is.an("object");

    const { book } = body;

    // Check fields used by the book-details page.
    [
      "title",
      "author",
      "isbn",
      "editor",
      "category",
      "language",
      "format",
      "description",
      "cover_image",
    ].forEach((field) => {
      expect(book[field], `book.${field}`).to.be.a("string").and.not.be.empty;
    });

    expect(book.id).to.be.a("number");
    expect(Number.isInteger(book.id)).to.equal(true);
    expect(book.id).to.be.greaterThan(0);

    expect(book.publication_year).to.be.a("number");
    expect(book.pages).to.be.a("number").and.be.greaterThan(0);

    expect(book.isAvailable).to.be.a("boolean");
    expect(book.availability_status).to.be.a("string");
    expect(book.recent_reviews).to.be.an("array");
  });
});

Then("the book details availability should be consistent", () => {
  cy.get("@bookDetailsResponse").then(({ body }) => {
    const { book, availability } = body;

    // Quantities must be nonnegative integers.
    ["total_copies", "available_copies", "reserved_copies"].forEach((field) => {
      expect(availability[field], field).to.be.a("number");
      expect(Number.isInteger(availability[field]), field).to.equal(true);
      expect(availability[field], field).to.be.at.least(0);
    });

    expect(availability.available_copies).to.be.at.most(
      availability.total_copies,
    );

    expect(availability.reserved_copies).to.be.at.most(
      availability.total_copies,
    );

    // The two response sections must describe the same stock.
    expect(availability.total_copies).to.equal(book.total_copies);
    expect(availability.available_copies).to.equal(book.available_copies);

    // A book can be available only when copies remain.
    expect(availability.isAvailable).to.equal(
      availability.available_copies > 0,
    );

    expect(book.isAvailable).to.equal(availability.isAvailable);
    expect(book.availability_status).to.equal(availability.status);
  });
});

Then("the book details statistics should be consistent", () => {
  cy.get("@bookDetailsResponse").then(({ body }) => {
    const { book, statistics } = body;

    ["total_reservations", "active_reservations", "total_reviews"].forEach(
      (field) => {
        expect(statistics[field], field).to.be.a("number");
        expect(Number.isInteger(statistics[field]), field).to.equal(true);
        expect(statistics[field], field).to.be.at.least(0);

        // These counters also appear inside the book object.
        expect(statistics[field], `${field} matches book`).to.equal(
          book[field],
        );
      },
    );

    expect(statistics.active_reservations).to.be.at.most(
      statistics.total_reservations,
    );

    // The observed response uses null inside book and zero inside
    // statistics when no ratings exist.
    if (book.average_rating === null) {
      expect(statistics.average_rating).to.equal(0);
    } else {
      expect(statistics.average_rating).to.be.a("number");
      expect(statistics.average_rating).to.equal(book.average_rating);
    }
  });
});

Then("the book details API message should be {string}", (message) => {
  cy.get("@bookDetailsResponse").its("body.message").should("eq", message);
});

Then("the book details API should not return a book", () => {
  cy.get("@bookDetailsResponse").then(({ body }) => {
    expect(body).not.to.have.property("book");
  });
});
