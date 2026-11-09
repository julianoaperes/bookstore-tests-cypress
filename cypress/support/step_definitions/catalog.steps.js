import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

import CatalogPage from "../../../pages/CatalogPage";

Given("I am on the catalog page", () => {
	CatalogPage.visitCatalogPage();
});

When("I search the catalog for {string}", (search) => {
	CatalogPage.search(search);
});

When("I clear the catalog search", () => {
	CatalogPage.search("");
});

When("I select the catalog category {string}", (category) => {
	CatalogPage.selectCategory(category);
});

When("I select the catalog publisher {string}", (publisher) => {
	CatalogPage.selectPublisher(publisher);
});

When("I select the catalog availability {string}", (availability) => {
	CatalogPage.selectAvailability(availability);
});

When("I remove all catalog filters", () => {
	CatalogPage.clearFilters();
});

When("I open the catalog with category {string}", (category) => {
	CatalogPage.visitCatalogPage(category);
});

When("I open catalog page {int}", (page) => {
	CatalogPage.openPage(page);
});

When("I switch the catalog to {string} view", (view) => {
	CatalogPage.switchView(view);
});

When("I open the catalog book {string} through its title", (title) => {
	CatalogPage.openBookTitle(title);
});

When("I open the details button for catalog book {string}", (title) => {
	CatalogPage.openBookDetails(title);
});

When("I add the catalog book {string} to the basket", (title) => {
	CatalogPage.addBookToBasket(title);
});

When("I open the basket from the catalog", () => {
	CatalogPage.openBasket();
});

When("I reload the catalog page", () => {
	CatalogPage.reload();
});

Then("I should see the catalog controls", () => {
	CatalogPage.assertControls();
});

Then("the catalog should display {int} of {int} books", (displayed, total) => {
	CatalogPage.assertResultsCount(displayed, total);
});

Then("the catalog book cards should contain their information", () => {
	CatalogPage.assertBookCards();
});

Then("the catalog should display these books:", (dataTable) => {
	const titles = dataTable.hashes().map((row) => row.title);

	CatalogPage.assertExactBooks(titles);
});

Then("the catalog should display the book {string}", (title) => {
	CatalogPage.assertBookVisible(title);
});

Then("the catalog should not display the book {string}", (title) => {
	CatalogPage.assertBookAbsent(title);
});

Then("the catalog should display no books", () => {
	CatalogPage.assertNoBooks();
});

Then("the catalog category field should display {string}", (category) => {
	CatalogPage.assertSelectedCategory(category);
});

Then("the catalog publisher should be {string}", (publisher) => {
	CatalogPage.assertSelectedPublisher(publisher);
});

Then("every catalog book should belong to {string}", (category) => {
	CatalogPage.assertEveryBookCategory(category);
});

Then("every displayed catalog book should be available", () => {
	CatalogPage.assertAvailableBooks();
});

Then("the catalog filters should be reset", () => {
	CatalogPage.assertFiltersReset();
});

Then("the catalog URL category should be {string}", (category) => {
	CatalogPage.assertUrlCategory(category);
});

Then("catalog page {int} should be active", (page) => {
	CatalogPage.assertActivePage(page);
});

Then("the catalog should use {string} view", (view) => {
	CatalogPage.assertView(view);
});

Then(
	"I should see the details of catalog book {string} with id {string}",
	(title, id) => {
		CatalogPage.assertBookDetails(title, id);
	},
);

Then("the catalog basket count should be {int}", (count) => {
	CatalogPage.assertBasketCount(count);
});

Then("the basket should contain the catalog book {string}", (title) => {
	CatalogPage.assertBookInBasket(title);
});
