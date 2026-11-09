// Load Cypress's configuration helper.
// defineConfig() provides editor assistance when defining Cypress settings.
const { defineConfig } = require("cypress");

// Load the function that creates an esbuild bundler.
// The bundler prepares test code and its imports for execution.
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

// Load the function that registers the Cucumber integration with Cypress.
const {
  addCucumberPreprocessorPlugin,
} = require("@badeball/cypress-cucumber-preprocessor");

// Load the Cucumber-specific esbuild plugin.
// It allows the bundler to process .feature files and their step definitions.
const {
  createEsbuildPlugin,
} = require("@badeball/cypress-cucumber-preprocessor/esbuild");

const { registerDatabaseTasks } = require("./cypress/tasks/database.cjs");

// Export the configuration so Cypress can load it.
// This file uses CommonJS syntax: require() and module.exports.
module.exports = defineConfig({
  // Settings for end-to-end testing.
  e2e: {
    // Tell Cypress which files to recognize as test specs.
    // cypress/e2e/ = start searching in this folder.
    // **/         = include any nested folders.
    // *.feature   = select files ending in .feature.
    // This pattern does not select ordinary .cy.js specs.
    specPattern: "cypress/e2e/**/*.feature",
    // Configure plugins and event handlers in Cypress's Node.js environment.
    // on     = function used to register Cypress event handlers.
    // config = the resolved Cypress configuration.
    // async  = allows us to await asynchronous plugin registration.
    async setupNodeEvents(on, config) {
      // Register the Cucumber integration.
      // await ensures registration finishes before setup continues.
      await addCucumberPreprocessorPlugin(on, config);
      registerDatabaseTasks(on, config);

      // Register the handler that prepares test files before execution.
      on(
        // Cypress invokes this event when a test file needs preprocessing.
        "file:preprocessor",

        // Create the esbuild handler that processes and bundles the test.
        createBundler({
          // Add Cucumber support to esbuild.
          // Pass config so the plugin uses this project's configuration.
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      // Return the configuration to Cypress.
      // This preserves any configuration changes made by the plugin.
      return config;
    },
    baseUrl: "http://localhost:3000/",
  },
});
