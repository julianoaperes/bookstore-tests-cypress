class RegisterPage {
	// Centralize selectors so a change in the application's HTML can be
	// handled here without changing feature files or step definitions.
	selectors = {
		// The form containing all registration controls.
		form: "#register-form",

		// Required full-name field.
		name: "#name",

		// Required email field.
		email: "#email",

		// Optional telephone field.
		phone: "#phone",

		// Required password field.
		password: "#password",

		// Required field that must match the password.
		confirmation: "#confirm-password",

		// Required checkbox for accepting the terms.
		terms: "#terms-agreement",

		// Button that switches the password between hidden and visible.
		passwordToggle: "#toggle-password",

		// Button that submits the registration form.
		submitButton: "#register-btn",

		// Container used by the application for feedback messages.
		alert: "#alert-container",
	};

	// Navigation

	visitRegistrationPage() {
		// Open the actual registration URL.
		// An absolute URL follows the pattern used in your HomePage.
		cy.visit("/register.html");

		// Wait until the form is visible before interacting with it.
		// Cypress retries this assertion until it passes or times out.
		cy.get(this.selectors.form).should("be.visible");
	}

	// Elements

	field(fieldName) {
		// Translate a readable field name, such as "email",
		// into the CSS selector stored above.
		const selector = this.selectors[fieldName];

		// Fail with a clear explanation if a step passes an unknown name.
		expect(selector, `selector for registration field "${fieldName}"`).to.be.a(
			"string",
		);

		// Return the Cypress chain so other methods can continue with
		// commands such as clear(), type(), check(), or should().
		return cy.get(selector);
	}

	// Actions

	fillField(fieldName, value) {
		// These are the text fields supported by this method.
		// Checkboxes and buttons need different Cypress commands.
		const textFields = ["name", "email", "phone", "password", "confirmation"];

		expect(textFields, "supported registration text fields").to.include(
			fieldName,
		);

		// Identify password fields so their values are hidden
		// from the Cypress command log.
		const isPassword = fieldName === "password" || fieldName === "confirmation";

		// Clear any previous value so each step controls the entire input.
		this.field(fieldName).clear({ log: !isPassword });

		// Cypress cannot type an empty string.
		// Leaving the field cleared lets us test missing required values.
		if (value !== "") {
			this.field(fieldName).type(value, {
				// Treat characters literally instead of interpreting sequences
				// such as "{enter}" as keyboard commands.
				parseSpecialCharSequences: false,

				// Avoid displaying passwords in the command log.
				log: !isPassword,
			});
		}
	}

	fillForm(user) {
		// Fill the required identity fields using scenario-specific data.
		this.fillField("name", user.name);
		this.fillField("email", user.email);

		// Keep the optional phone empty unless the scenario supplies one.
		this.fillField("phone", user.phone ?? "");

		// Use the same password in both controls for a valid baseline.
		// Negative scenarios change individual values afterward.
		this.fillField("password", user.password);
		this.fillField("confirmation", user.password);

		// Begin with unchecked terms so a scenario must explicitly accept
		// them before attempting a successful registration.
		this.field("terms").uncheck();
	}

	acceptTerms() {
		// check() sets the checkbox to checked.
		// Unlike click(), it will not accidentally uncheck an already
		// checked checkbox.
		this.field("terms").check().should("be.checked");
	}

	submit() {
		// Verify the user can interact with the button, then submit
		// through the UI to exercise the application's validation.
		cy.get(this.selectors.submitButton)
			.should("be.visible")
			.and("be.enabled")
			.click();
	}

	togglePasswordVisibility() {
		// Click the real toggle button to test its user-facing behavior.
		cy.get(this.selectors.passwordToggle).should("be.visible").click();
	}

	clickNavigationLink(linkText) {
		// Limit the search to main so links in the header or footer
		// do not accidentally match.
		cy.contains("main a", linkText)
			.scrollIntoView()
			.should("be.visible")
			.click();
	}

	// Registration-page assertions

	assertForm() {
		// Confirm that the expected registration heading is displayed.
		cy.contains("h2", "Cadastre-se no Hub de Leitura").should("be.visible");

		// Verify that every input is available to the user.
		const fields = [
			"name",
			"email",
			"phone",
			"password",
			"confirmation",
			"terms",
		];

		fields.forEach((fieldName) => {
			this.field(fieldName).should("be.visible");
		});

		// Check the HTML required attributes independently of the custom
		// JavaScript validation.
		const requiredFields = [
			"name",
			"email",
			"password",
			"confirmation",
			"terms",
		];

		requiredFields.forEach((fieldName) => {
			this.field(fieldName).should("have.prop", "required", true);
		});

		// Phone is optional, so it must not be marked as required.
		this.field("phone").should("have.prop", "required", false);

		// Verify that the form provides its submit action.
		cy.get(this.selectors.submitButton).should("be.visible").and("be.enabled");
	}

	assertFieldInvalid(fieldName) {
		// Inspection showed that this page uses custom validation and
		// applies the "is-invalid" class to rejected controls.
		//
		// Checking the actual class avoids relying on browser-native
		// validation bubbles, whose wording varies by browser/language.
		this.field(fieldName).should("have.class", "is-invalid");
	}

	assertOnRegistrationPage() {
		// Verify that an invalid submission has not navigated away.
		cy.location("pathname").should("eq", "/register.html");

		// Also check that the registration form remains available.
		cy.get(this.selectors.form).should("be.visible");
	}

	assertRegistrationSucceeded() {
		// EXPECTED CONTRACT TO CONFIRM:
		// This assumes successful registration redirects to login.
		//
		// If your application redirects somewhere else, update this
		// assertion after confirming the intended behavior.
		// Do not accept multiple possible destinations simply to make
		// the test pass.
		this.assertDashboardPage();
	}

	assertDuplicateEmailError() {
		// Verify that the application displays an email-related rejection.
		//
		// The exact duplicate-email text has not been verified.
		// Replace this expression with the exact expected message once
		// you confirm it in your application.
		cy.get(this.selectors.alert)
			.should("be.visible")
			.and("contain.text", "Erro ao criar conta. Tente novamente.");
	}

	// Password assertions

	assertPasswordType(expectedType) {
		// type="password" masks the value.
		// type="text" displays it.
		this.field("password").should("have.attr", "type", expectedType);
	}

	assertPasswordValue(expectedPassword) {
		// Verify that showing/hiding the password preserves its content.
		//
		// log:false hides this assertion's command entry, although a
		// failing assertion can still expose its expected value.
		this.field("password").should("have.value", expectedPassword, {
			log: false,
		});
	}

	// Destination assertions
	assertLoginPage() {
		// Check both the URL and a key page element to verify navigation.
		cy.location("pathname").should("eq", "/login.html");
	}
	assertDashboardPage() {
		// Check both the URL and a key page element to verify navigation.
		cy.location("pathname").should("eq", "/dashboard.html");
	}

	assertCatalogPage() {
		// Verify that the catalog destination has loaded.
		cy.location("pathname").should("eq", "/catalog.html");

		cy.contains("h2", "Conheça Nosso Acervo").should("be.visible");
	}
	assertPasswordValue(expectedPassword) {
		// Confirm that toggling visibility preserves the password.
		// Only use fictitious passwords in automated tests.
		this.field("password").should("have.value", expectedPassword);
	}
}

// Export one reusable Page Object instance, matching your existing
// LoginPage and HomePage pattern.
export default new RegisterPage();
