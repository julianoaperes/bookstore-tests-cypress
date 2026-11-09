class LoginPage {
  // Selectors
  selectors = {
    form: "#login-form",
    email: "#email",
    password: "#password",
    submitButton: "#login-btn",
    alert: "#alert-container",
  };

  // Elements
  emailInput() {
    return cy.get(this.selectors.email);
  }

  passwordInput() {
    return cy.get(this.selectors.password);
  }

  submitButton() {
    return cy.get(this.selectors.submitButton);
  }

  // Navigation
  visitLoginPage() {
    this.visit();
  }

  visit() {
    cy.visit("/login.html");

    cy.get(this.selectors.form).should("be.visible");
    this.emailInput().should("be.visible");
    this.passwordInput().should("be.visible");
  }

  // Actions
  typeEmail(email) {
    this.emailInput().clear().type(email, {
      parseSpecialCharSequences: false,
    });
  }

  typePassword(password) {
    this.passwordInput().clear().type(password, {
      log: false,
      parseSpecialCharSequences: false,
    });
  }

  submit() {
    this.submitButton().should("be.enabled").click();
  }

  // Assertions
  assertLoginError(message) {
    cy.get(this.selectors.alert)
      .should("be.visible")
      .and("contain.text", message);
  }

  assertOnLoginPage() {
    cy.location("pathname").should("eq", "/login.html");
    cy.get(this.selectors.form).should("be.visible");
  }

  assertEmailRequired() {
    this.emailInput().should(($input) => {
      const input = $input[0];

      expect(input.required, "email is required").to.equal(true);
      expect(input.value, "email is empty").to.equal("");

      expect(input.validity.valueMissing, "email has a missing value").to.equal(
        true,
      );
    });
  }

  assertPasswordRequired() {
    this.passwordInput().should(($input) => {
      const input = $input[0];

      expect(input.required, "password is required").to.equal(true);
      expect(input.value, "password is empty").to.equal("");

      expect(
        input.validity.valueMissing,
        "password has a missing value",
      ).to.equal(true);
    });
  }

  assertInvalidEmailFormat() {
    this.emailInput().should(($input) => {
      expect(
        $input[0].validity.typeMismatch,
        "email format is invalid",
      ).to.equal(true);
    });
  }
}

export default new LoginPage();
