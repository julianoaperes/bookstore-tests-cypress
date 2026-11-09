// This class represents the home page using the Page Object Model (POM).
// It centralizes selectors, actions, and assertions so step definitions
// can describe test behavior without repeating Cypress commands.
class HomePage {
	// Keep selectors together so an HTML change can be updated in one place.
	//
	// CSS selector meanings:
	// "header"        -> selects an HTML tag.
	// "#home"         -> selects an element with id="home".
	// ".category-tile" -> selects elements with class="category-tile".
	selectors = {
		// Shared navigation areas.
		header: "header",
		footer: "footer",

		// Main sections of the home page.
		homeSection: "#home",
		featuredSection: "#catalogo",
		servicesSection: "#services",
		categoriesSection: "#explore",
		aboutSection: "#sobre",
		contactSection: "#contact",

		// Clickable category cards on the home page.
		categoryTile: ".category-tile",

		// Category dropdown on the destination catalog page.
		catalogCategoryFilter: "#category-filter",

		// Contact form container.
		contactForm: "#contactForm",

		// Scope each field to the contact form.
		// For example, "#contactForm #email" selects the email input
		// inside the contact form, avoiding email inputs elsewhere.
		contactName: "#contactForm #name",
		contactEmail: "#contactForm #email",
		contactSubject: "#contactForm #subject",
		contactMessage: "#contactForm #message",
		contactSubmitButton: "#contactForm #btn-submit",

		// Container used by the application to display feedback.
		alert: "#alert-container",
	};

	// ELEMENT METHODS
	//
	// Each method returns a Cypress chain for an element.
	// Returning the chain allows callers to continue with commands
	// such as .clear(), .type(), .select(), and .should().
	//
	// "this" refers to the HomePage instance.
	// this.selectors.contactName retrieves its stored CSS selector.

	contactNameInput() {
		return cy.get(this.selectors.contactName);
	}

	contactEmailInput() {
		return cy.get(this.selectors.contactEmail);
	}

	contactSubjectSelect() {
		return cy.get(this.selectors.contactSubject);
	}

	contactMessageInput() {
		return cy.get(this.selectors.contactMessage);
	}

	contactSubmitButton() {
		return cy.get(this.selectors.contactSubmitButton);
	}

	// NAVIGATION METHODS

	visitHomePage() {
		// Open the home page.
		// cy.visit() needs a plain URL, without Markdown link formatting.
		cy.visit("http://localhost:3000/index.html");

		// Confirm that the opening section is displayed.
		cy.get(this.selectors.homeSection).should("be.visible");

		// Confirm the contact form exists in the DOM.
		// "exist" does not require the form to be visible.
		cy.get(this.selectors.contactForm).should("exist");
	}

	clickCatalogButton(button) {
		// "button" is the text passed by the step definition,
		// for example: "Explorar Catálogo".
		//
		// Restrict the search to button elements so another element
		// containing similar text is not selected.
		cy.contains("button", button)
			.should("be.visible")
			// .and() adds another assertion to the same chain.
			.and("be.enabled")
			.click();
	}

	clickHeaderLink(link) {
		// A template literal inserts the header selector into the string.
		// `${this.selectors.header} a` becomes "header a".
		//
		// This searches for an anchor inside a header containing
		// the supplied text, such as "ENTRAR".
		cy.contains(`${this.selectors.header} a`, link)
			.should("be.visible")
			.click();
	}

	clickFooterLink(link) {
		// Restrict the link search to the footer.
		// This distinguishes footer links from similarly named header links.
		cy.contains(`${this.selectors.footer} a`, link)
			// Bring the link into the viewport before checking and clicking it.
			.scrollIntoView()
			.should("be.visible")
			.click();
	}

	selectCategory(category) {
		// Start inside the categories section to keep the search specific.
		cy.get(this.selectors.categoriesSection)
			// Find a category tile containing the supplied category name.
			.contains(this.selectors.categoryTile, category)
			.scrollIntoView()
			.should("be.visible")
			.click();
	}

	assertNoBooksFoundForCategory(category) {
		// Reuse the common checks that confirm the catalog page loaded.
		this.assertCatalogPage();

		// "search" is the query-string portion of the URL.
		// Example: "?category=Hist%C3%B3ria".
		//
		// Cypress retries this callback assertion until it passes
		// or reaches the configured timeout.
		cy.location("search").should((search) => {
			// Parse the query string into named parameters.
			// URLSearchParams also decodes encoded characters.
			const params = new URLSearchParams(search);

			// Check the requested category, even when that category
			// does not appear as an option in the catalog dropdown.
			expect(params.get("category"), "category URL parameter").to.equal(
				category,
			);
		});

		// Confirm that the catalog displays its empty-results message.
		// Restrict the search to the main content area.
		cy.contains("main", "Nenhum livro encontrado").should("be.visible");

		// This checks the visible message.
		// It does not independently assert that all book cards are absent.
	}

	// CONTACT FORM ACTIONS

	typeContactName(name) {
		// Use the reusable element method to locate the name field.
		this.contactNameInput()
			// Remove any previous value before entering the test data.
			.clear()
			.type(name, {
				// Type text literally.
				// For example, "{enter}" would be text rather than a key press.
				parseSpecialCharSequences: false,
			});
	}

	typeContactEmail(email) {
		this.contactEmailInput().clear().type(email, {
			parseSpecialCharSequences: false,
		});
	}

	selectContactSubject(subject) {
		// Select an option from the native HTML <select>.
		// Cypress accepts an option's value or displayed label,
		// such as "Sugestões".
		this.contactSubjectSelect().select(subject);
	}

	typeContactMessage(message) {
		this.contactMessageInput().clear().type(message, {
			parseSpecialCharSequences: false,
		});
	}

	submitContactForm() {
		// Click the real submit button to exercise the user interaction
		// and the validation behavior attached to it.
		this.contactSubmitButton()
			.scrollIntoView()
			.should("be.visible")
			.and("be.enabled")
			.click();

		// The success or error result is checked separately.
		// That lets different scenarios reuse this action.
	}

	// HOME PAGE ASSERTIONS

	assertHeading() {
		// Check a recognizable heading to confirm the expected content.
		// Limiting the search to h2 avoids matching an unrelated paragraph.
		cy.contains("h2", "Descubra o Mundo dos Livros").should("be.visible");
	}

	assertMainSections() {
		// Each array entry pairs a section selector with its expected heading.
		// This avoids repeating the same assertion block five times.
		const sections = [
			[this.selectors.featuredSection, "Livros em Destaque"],
			[this.selectors.servicesSection, "Nossos Serviços"],
			[this.selectors.categoriesSection, "Explore por Categoria"],
			[this.selectors.aboutSection, "Sobre a Biblioteca Virtual"],
			[this.selectors.contactSection, "Entre em Contato"],
		];

		// Destructuring gives each pair readable variable names:
		// selector = the section's CSS selector.
		// heading  = the expected heading text.
		sections.forEach(([selector, heading]) => {
			// These Cypress commands are queued in iteration order.
			cy.get(selector)
				.scrollIntoView()
				.should("be.visible")
				.within(() => {
					// .within() scopes commands in this callback to this section.
					// This ensures the heading belongs to the correct section.
					cy.contains("h2", heading).should("be.visible");
				});
		});
	}

	assertFeaturedBooks() {
		cy.get(this.selectors.featuredSection)
			.scrollIntoView()
			.within(() => {
				// Find the featured titles inside this section.
				//
				// $titles is a jQuery collection supplied by Cypress.
				// The "$" prefix is a naming convention, not special syntax.
				cy.get("h3").should(($titles) => {
					// Ensure at least one title exists.
					// Avoid a fixed count because the featured selection can change.
					expect($titles.length, "featured book count").to.be.greaterThan(0);

					// Spread syntax converts the collection into a normal array.
					[...$titles].forEach((title) => {
						// textContent reads the title text.
						// trim() removes surrounding whitespace.
						expect(title.textContent.trim(), "book title").not.to.equal("");
					});
				});

				// CSS [alt^="Capa do livro"] means:
				// select images whose alt attribute STARTS WITH "Capa do livro".
				cy.get('img[alt^="Capa do livro"]').should(($images) => {
					expect($images.length, "book cover count").to.be.greaterThan(0);

					[...$images].forEach((image) => {
						// complete indicates that loading has finished.
						// A broken image can also report complete=true,
						// so naturalWidth is checked as well.
						expect(image.complete, image.alt).to.equal(true);

						// A successfully loaded cover should have a positive width.
						// image.alt identifies the cover in assertion output.
						expect(image.naturalWidth, image.alt).to.be.greaterThan(0);
					});
				});

				// These checks validate titles and images as separate groups.
				// They do not prove that every individual card has both,
				// or check authors and availability.
			});
	}

	assertOnHomePage() {
		// "pathname" is the URL path without query parameters or a hash.
		cy.location("pathname").should("eq", "/index.html");

		// Check content too: the URL alone does not prove the page rendered.
		cy.get(this.selectors.homeSection).should("be.visible");
	}

	// DESTINATION PAGE ASSERTIONS
	//
	// These are small checks that navigation from the home page worked.
	// A larger project could move them into CatalogPage and LoginPage.

	assertCatalogPage() {
		cy.location("pathname").should("eq", "/catalog.html");

		// Verify recognizable catalog content.
		cy.contains("h2", "Conheça Nosso Acervo").should("be.visible");

		// Confirm the catalog's category control is displayed.
		cy.get(this.selectors.catalogCategoryFilter).should("be.visible");
	}

	assertLoginPage() {
		cy.location("pathname").should("eq", "/login.html");

		// Confirm the destination contains its login form.
		cy.get("#login-form").should("be.visible");
	}

	assertSelectedCategory(category) {
		this.assertCatalogPage();

		// Check that navigation preserved the requested category.
		cy.location("search").should((search) => {
			const params = new URLSearchParams(search);

			expect(params.get("category"), "category URL parameter").to.equal(
				category,
			);
		});

		// Check that the dropdown reflects the same category.
		// Use this method for categories that exist in the dropdown.
		cy.get(this.selectors.catalogCategoryFilter).should("have.value", category);

		// This does not check whether every displayed book
		// actually belongs to the selected category.
	}

	assertContactSection() {
		// Confirm that Help navigation kept us on the home page.
		cy.location("pathname").should("eq", "/index.html");

		// "hash" is the URL fragment identifying the target section.
		cy.location("hash").should("eq", "#contact");

		cy.get(this.selectors.contactSection).should("be.visible");

		cy.get(this.selectors.contactForm).should("be.visible");

		// Visibility does not itself prove precise scroll positioning.
		// The hash confirms the intended anchor destination.
	}

	// CONTACT FORM ASSERTIONS

	assertContactError(message) {
		// Check that application feedback is visible and contains
		// the expected message supplied by the scenario.
		cy.get(this.selectors.alert)
			.should("be.visible")
			.and("contain.text", message);

		// contain.text allows surrounding whitespace or extra text.
		// It does not require the container's entire text to match exactly.
	}

	assertInvalidContactEmail() {
		this.contactEmailInput().should(($input) => {
			// $input[0] retrieves the native HTML input from
			// the jQuery collection so its validity properties can be read.
			//
			// For type="email", typeMismatch is true when a non-empty value
			// does not satisfy the browser's email-format rules.
			expect(
				$input[0].validity.typeMismatch,
				"contact email format is invalid",
			).to.equal(true);

			// valid=false confirms that at least one validity rule fails.
			// It is already implied by typeMismatch=true, but makes
			// the overall invalid state explicit.
			expect($input[0].validity.valid, "contact email is not valid").to.equal(
				false,
			);

			// These assertions check native HTML validity only.
			// They do not verify a visible application error,
			// email ownership, or that a backend request was blocked.
		});
	}
}

// Create one HomePage instance and export it as the default export.
// Step definitions can import it and call methods directly:
//
// import HomePage from "../../../pages/HomePage";
// HomePage.visitHomePage();
//
// The instance stores selectors and methods, not cached DOM elements.
// Each element method queries the page again when called.
export default new HomePage();
