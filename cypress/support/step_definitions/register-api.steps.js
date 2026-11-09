import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

import { faker } from "@faker-js/faker";

import AuthApi from "../../../api/AuthApi";

Given("I have a new API registration user", () => {
	const user = {
		name: "QA Registration User",

		// A unique address keeps repeated executions independent.
		email: `qa-${faker.string.uuid()}@example.com`,

		password: "Example123!",
	};

	// Phone is deliberately omitted because it is optional.
	// Password confirmation and terms acceptance are UI controls;
	// the observed frontend does not send them in this API payload.
	cy.wrap(user, { log: false }).as("apiRegistrationUser");
});

When(
	"I set the API registration field {string} to {string}",
	(field, value) => {
		expect(["name", "email", "password", "phone"]).to.include(field);

		cy.get("@apiRegistrationUser", { log: false }).then((user) => {
			// Create a replacement object rather than modifying the
			// original object in place.
			const updatedUser = {
				...user,
				[field]: value,
			};

			cy.wrap(updatedUser, { log: false }).as("apiRegistrationUser");
		});
	},
);

When("I omit the API registration field {string}", (field) => {
	expect(["name", "email", "password", "phone"]).to.include(field);

	cy.get("@apiRegistrationUser", { log: false }).then((user) => {
		const updatedUser = { ...user };

		// An absent property differs from a property containing "".
		delete updatedUser[field];

		cy.wrap(updatedUser, { log: false }).as("apiRegistrationUser");
	});
});

When("I submit the user to the registration API", () => {
	cy.get("@apiRegistrationUser", { log: false }).then((user) => {
		AuthApi.register(user).as("registrationApiResponse");
	});
});

Then("the registration API status should be {int}", (status) => {
	cy.get("@registrationApiResponse", { log: false })
		.its("status")
		.should("eq", status);
});

Then("the registration API should return JSON", () => {
	cy.get("@registrationApiResponse", { log: false }).then(({ headers }) => {
		expect(headers["content-type"]).to.include("application/json");
	});
});

Then("the registration API should return an error message", () => {
	cy.get("@registrationApiResponse", { log: false }).then(({ body }) => {
		// Check that the rejected request provides an explanation.
		// Exact wording can be asserted once the contract is confirmed.
		expect(body).to.be.an("object");

		expect(body.message, "registration error message").to.be.a("string");

		expect(body.message.trim(), "nonblank error message").not.to.equal("");
	});
});

When("I log in through the API using the new registration credentials", () => {
	cy.get("@apiRegistrationUser", { log: false }).then((user) => {
		// Logging in verifies that registration created a usable
		// account, rather than merely returning a success status.
		AuthApi.login({
			email: user.email,
			password: user.password,
		}).as("newRegistrationLoginResponse");
	});
});

Then("the new registration login status should be {int}", (status) => {
	cy.get("@newRegistrationLoginResponse", { log: false })
		.its("status")
		.should("eq", status);
});

Then("the new registration login should return a token", () => {
	cy.get("@newRegistrationLoginResponse", { log: false }).then(({ body }) => {
		// Assert the token's presence without printing its value.
		expect(
			typeof body.token === "string" && body.token.trim().length > 0,
			"new account received an authentication token",
		).to.equal(true);
	});
});
