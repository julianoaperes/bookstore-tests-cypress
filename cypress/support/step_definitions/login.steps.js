/// <reference types="cypress" />

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../../pages/LoginPage.js";

Given("I am on the login page", () => {
  LoginPage.visitLoginPage();
});

When("I type a valid email", () => {
  LoginPage.typeEmail(Cypress.env("LOGIN_EMAIL"));
});

When("I type a valid password", () => {
  LoginPage.typePassword(Cypress.env("LOGIN_PASSWORD"));
});

When("I click on the submit button", () => {
  LoginPage.submit();
});
Then("I should be logged in successfully", () => {
  cy.location("pathname").should("eq", "/dashboard.html");
});

When("I type a valid password", () => {
  LoginPage.typePassword("user123");
});

When("I type the email {string}", (email) => {
  LoginPage.typeEmail(email);
});

When("I type the password {string}", (password) => {
  LoginPage.typePassword(password);
});

Then("I should see the login error {string}", (message) => {
  LoginPage.assertLoginError(message);
});

Then("I should remain on the login page", () => {
  LoginPage.assertOnLoginPage();
});

Then("the email field should be required", () => {
  LoginPage.assertEmailRequired();
});

Then("the password field should be required", () => {
  LoginPage.assertPasswordRequired();
});

Then("the email field should have an invalid format", () => {
  LoginPage.assertInvalidEmailFormat();
});
