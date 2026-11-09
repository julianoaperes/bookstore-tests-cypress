import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

import AuthApi from "../../../api/AuthApi";

Given("I have registered test account credentials", () => {
  // Read credentials from configuration instead of hardcoding
  // a real account password in the test source.
  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  // Fail clearly when the required test configuration is missing.
  expect(email, "configured LOGIN_EMAIL").to.be.a("string").and.not.be.empty;

  expect(password, "configured LOGIN_PASSWORD").to.be.a("string").and.not.be
    .empty;

  // Disable logging because the object contains a password.
  cy.wrap({ email, password }, { log: false }).as("apiLoginCredentials");
});

When("I authenticate through the login API", () => {
  cy.get("@apiLoginCredentials", { log: false }).then((credentials) => {
    AuthApi.login(credentials).as("loginApiResponse");
  });
});

When("I authenticate through the login API with an incorrect password", () => {
  cy.get("@apiLoginCredentials", { log: false }).then((credentials) => {
    // Append characters so the supplied password differs
    // from the registered account's configured password.
    AuthApi.login({
      email: credentials.email,
      password: `${credentials.password}-incorrect`,
    }).as("loginApiResponse");
  });
});

When(
  "I request API login with email {string} and password {string}",
  (email, password) => {
    AuthApi.login({ email, password }).as("loginApiResponse");
  },
);

When("I request API login omitting {string}", (field) => {
  const credentials = {
    email: "qa@example.com",
    password: "Example123!",
  };

  // Omitted fields differ from fields containing empty strings.
  if (field === "both") {
    delete credentials.email;
    delete credentials.password;
  } else {
    expect(["email", "password"]).to.include(field);
    delete credentials[field];
  }

  AuthApi.login(credentials).as("loginApiResponse");
});

Then("the login API status should be {int}", (status) => {
  cy.get("@loginApiResponse", { log: false })
    .its("status")
    .should("eq", status);
});

Then("the login API should return JSON", () => {
  cy.get("@loginApiResponse", { log: false }).then(({ headers }) => {
    expect(headers["content-type"]).to.include("application/json");
  });
});

Then("the login API should return an authentication token", () => {
  cy.get("@loginApiResponse", { log: false }).then(({ body }) => {
    // Check presence without printing the token value.
    expect(
      typeof body.token === "string" && body.token.trim().length > 0,
      "nonempty authentication token",
    ).to.equal(true);
  });
});

Then("the login API should not return an authentication token", () => {
  cy.get("@loginApiResponse", { log: false }).then(({ body }) => {
    // A rejected request must not issue a usable token.
    expect(Boolean(body.token), "authentication token was issued").to.equal(
      false,
    );
  });
});
