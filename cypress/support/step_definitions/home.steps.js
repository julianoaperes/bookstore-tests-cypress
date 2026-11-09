import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

import HomePage from "../../../pages/HomePage";

// Navigation
Given("I am on the home page", () => {
  HomePage.visitHomePage();
});

When("I click the home button {string}", (button) => {
  HomePage.clickCatalogButton(button);
});

When("I click the home header link {string}", (link) => {
  HomePage.clickHeaderLink(link);
});

When("I click the home footer link {string}", (link) => {
  HomePage.clickFooterLink(link);
});

When("I select the home category {string}", (category) => {
  HomePage.selectCategory(category);
});

// Contact form
When("I enter the home contact name {string}", (name) => {
  HomePage.typeContactName(name);
});

When("I enter the home contact email {string}", (email) => {
  HomePage.typeContactEmail(email);
});

When("I select the home contact subject {string}", (subject) => {
  HomePage.selectContactSubject(subject);
});

When("I enter the home contact message {string}", (message) => {
  HomePage.typeContactMessage(message);
});

When("I submit the home contact form", () => {
  HomePage.submitContactForm();
});

Then("I should see no books found for the category {string}", (category) => {
  HomePage.assertNoBooksFoundForCategory(category);
});

// Assertions
Then("I should see the home page heading", () => {
  HomePage.assertHeading();
});

Then("I should see the main home page sections", () => {
  HomePage.assertMainSections();
});

Then("I should see featured books with titles and cover images", () => {
  HomePage.assertFeaturedBooks();
});

Then("the home navigation should open the catalog", () => {
  HomePage.assertCatalogPage();
});

Then("the home navigation should open the login page", () => {
  HomePage.assertLoginPage();
});

Then("the catalog category should be {string}", (category) => {
  HomePage.assertSelectedCategory(category);
});

Then("I should reach the home contact section", () => {
  HomePage.assertContactSection();
});

Then("I should see the home contact error {string}", (message) => {
  HomePage.assertContactError(message);
});

Then("the home contact email should have an invalid format", () => {
  HomePage.assertInvalidContactEmail();
});

Then("I should remain on the home page", () => {
  HomePage.assertOnHomePage();
});
