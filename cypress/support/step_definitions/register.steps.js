import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

import { faker } from "@faker-js/faker";

import RegisterPage from "../../../pages/RegisterPage";

// This object is replaced whenever a scenario requests a new user.
// The duplicate-email scenario deliberately reuses it.
let registrationUser;

Given("I am on the registration page", () => {
	RegisterPage.visitRegistrationPage();
});

When("I fill the registration form with a new user", () => {
	registrationUser = {
		name: "Juliano Test User",

		// A unique address reduces collisions between repeated test runs.
		email: `qa-${faker.string.uuid()}@example.com`,

		password: "Example123!",
	};

	RegisterPage.fillForm(registrationUser);
});

When("I fill the registration form with the same user", () => {
	expect(registrationUser, "previously created registration data").to.exist;

	RegisterPage.fillForm(registrationUser);
});

When("I change the registration field {string} to {string}", (field, value) => {
	RegisterPage.fillField(field, value);
});

When("I restore the new user's registration email", () => {
	RegisterPage.fillField("email", registrationUser.email);
});

When("I enter the registration phone {string}", (phone) => {
	RegisterPage.fillField("phone", phone);
});

When("I accept the registration terms", () => {
	RegisterPage.acceptTerms();
});

When("I submit the registration form", () => {
	RegisterPage.submit();
});

When("I toggle the registration password visibility", () => {
	RegisterPage.togglePasswordVisibility();
});

When("I click the registration link {string}", (link) => {
	RegisterPage.clickNavigationLink(link);
});

Then("I should see the registration fields", () => {
	RegisterPage.assertForm();
});

Then("the registration field {string} should be invalid", (field) => {
	RegisterPage.assertFieldInvalid(field);
});

Then("I should remain on the registration page", () => {
	RegisterPage.assertOnRegistrationPage();
});

Then("the registration should succeed", () => {
	RegisterPage.assertRegistrationSucceeded();
});

Then("the registration password should be visible", () => {
	RegisterPage.assertPasswordType("text");
});

Then("the registration password should be hidden", () => {
	RegisterPage.assertPasswordType("password");
});

Then("the registration password should contain {string}", (password) => {
	RegisterPage.assertPasswordValue(password);
});

Then("I should see a duplicate registration email error", () => {
	RegisterPage.assertDuplicateEmailError();
});

Then("I should reach the login page from registration", () => {
	RegisterPage.assertLoginPage();
});

Then("I should reach the catalog page from registration", () => {
	RegisterPage.assertCatalogPage();
});
