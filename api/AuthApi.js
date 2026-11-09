class AuthApi {
	// Authentication uses the same server as the catalog API.
	baseUrl = "http://localhost:3000";

	login(credentials) {
		// Return the request so steps can inspect and alias its response.
		return cy.request({
			method: "POST",
			url: `${this.baseUrl}/api/login`,

			// Cypress serializes this object as JSON.
			// Passing the object unchanged allows tests to omit fields.
			body: credentials,

			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},

			// Negative scenarios deliberately expect error responses.
			failOnStatusCode: false,

			// Avoid displaying credentials and tokens in the command log.
			log: false,
		});
	}
	register(user) {
		// Call the registration endpoint directly.
		// Passing the object unchanged allows negative tests to
		// omit fields or send empty values.
		return cy.request({
			method: "POST",
			url: `${this.baseUrl}/api/register`,

			body: user,

			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},

			// Preserve error responses for explicit assertions.
			failOnStatusCode: false,

			// Avoid printing passwords or returned credentials.
			log: false,
		});
	}
}

export default new AuthApi();
