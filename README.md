# Cypress + Cucumber End-to-End Testing

This project is a JavaScript starter for end-to-end (E2E) testing with Cypress and Cucumber. It describes application behavior in readable Gherkin scenarios and connects each scenario step to JavaScript code that runs in a browser.

The repository currently contains one example scenario. It opens `https://example.cypress.io` and checks that the text **Kitchen Sink** is visible. The project contains the test setup; it does not include an application server that needs to be started before this example runs.

## Contents

- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the tests](#running-the-tests)
- [Project structure](#project-structure)
- [How the example works](#how-the-example-works)
- [Configuration explained](#configuration-explained)
- [Adding a feature](#adding-a-feature)
- [Support files and fixtures](#support-files-and-fixtures)
- [Testing another application](#testing-another-application)
- [Troubleshooting](#troubleshooting)
- [Current scope](#current-scope)
- [License](#license)

## Technology stack

All four packages below are development dependencies. The version ranges come from `package.json`; `package-lock.json` records the exact dependency versions used for installation.

| Package                                   | Declared version | Role                                                                             |
| ----------------------------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `cypress`                                 | `^16.2.1`        | Runs browser tests, provides commands and assertions, and displays test results. |
| `@badeball/cypress-cucumber-preprocessor` | `^28.0.1`        | Connects Gherkin feature files and JavaScript step definitions to Cypress.       |
| `@bahmutov/cypress-esbuild-preprocessor`  | `^2.2.8`         | Registers an esbuild-based file preprocessor with Cypress.                       |
| `esbuild`                                 | `^0.28.2`        | Bundles the feature files and their JavaScript dependencies for execution.       |

Cucumber supports behavior-driven development (BDD): scenarios describe observable behavior, while step definitions implement the browser interactions and checks.

## Requirements

- **Node.js compatible with the installed Cypress version.** Cypress `16.2.1` declares the Node.js range `^22.0.0 || ^24.0.0 || >=26.0.0`. Node.js 22 satisfies this requirement.
- **npm**, used to install dependencies and run the project scripts.
- **Internet access** to download dependencies and the Cypress binary, and to reach `https://example.cypress.io` when running the included scenario.
- A graphical desktop environment to use the interactive Cypress application. Headless execution does not require opening the interactive application.

Check your local Node.js and npm versions:

```sh
node --version
npm --version
```

The repository does not currently declare its own `engines` field or Node.js version file. Check dependency requirements again if you upgrade Cypress.

## Installation

Open a terminal in the project root, where `package.json` and `cypress.config.cjs` are located, then run:

```sh
npm ci
```

`npm ci` installs the versions recorded in `package-lock.json`. It requires that the lockfile matches `package.json` and replaces any existing `node_modules` directory. Development dependencies must be included because they contain the entire test toolchain.

If you intentionally change dependencies, use `npm install` to update the installation and lockfile together.

## Running the tests

Run all commands from the project root.

### Interactive mode

```sh
npm run cy:open
```

This opens the Cypress application. Select E2E Testing and an available browser if prompted, then open `example.feature`. The runner shows each scenario step, the commands it executes, and any assertion failures. This mode is useful while writing or debugging tests.

### Headless mode

```sh
npm run cy:run
```

This runs the matching feature files without opening the interactive application and prints results in the terminal. It uses Cypress's bundled Electron browser by default. A failing test produces a nonzero exit code, which can be used by automation.

### Run a specific feature

```sh
npm run cy:run -- --spec "cypress/e2e/example.feature"
```

The `--` after the npm script name forwards the remaining arguments to Cypress.

### Run with Chrome

```sh
npm run cy:run -- --browser chrome
```

Chrome must be installed and discoverable by Cypress to use this option.

### Available npm scripts

| Command           | Behavior                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| `npm run cy:open` | Opens the interactive Cypress application.                                         |
| `npm run cy:run`  | Runs the E2E feature files in headless mode.                                       |
| `npm test`        | Runs a placeholder that prints `Error: no test specified` and exits with code `1`. |

Use `npm run cy:run` to execute the tests. The `test` script has not been connected to Cypress.

## Project structure

```text
.
|-- .cypress-cucumber-preprocessorrc.json  # Feature-to-step-definition mapping
|-- cypress.config.cjs                    # Cypress and bundler configuration
|-- package.json                          # Dependencies and npm scripts
|-- package-lock.json                     # Exact dependency versions
|-- README.md                             # Project documentation
`-- cypress/
    |-- e2e/
    |   |-- example.feature               # Gherkin feature and scenario
    |   `-- example.js                    # JavaScript step definitions
    |-- fixtures/
    |   `-- example.json                  # Sample test data; currently unused
    `-- support/
        |-- e2e.js                        # Loads shared test support
        `-- commands.js                   # Place for custom Cypress commands
```

## How the example works

The feature file, `cypress/e2e/example.feature`, describes the expected behavior:

```gherkin
Feature: Example website

  Scenario: Open the home page
    Given I open the example website
    Then I should see the page heading
```

The Gherkin keywords organize the scenario:

- **Feature** names the behavior being described.
- **Scenario** describes one example of that behavior.
- **Given** establishes the starting state, such as opening a page.
- **When** describes an action. The included scenario does not need a separate action step.
- **Then** checks the expected result.

The matching file, `cypress/e2e/example.js`, implements the steps:

```js
import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I open the example website", () => {
  cy.visit("https://example.cypress.io");
});

Then("I should see the page heading", () => {
  cy.contains("Kitchen Sink").should("be.visible");
});
```

The step text in the feature matches the expressions registered with `Given` and `Then`. `cy.visit()` navigates to the example website. `cy.contains()` finds an element containing the supplied text, and `.should("be.visible")` checks its visibility. Cypress retries the query and assertion until they pass or time out.

Although the step is named “I should see the page heading,” the implementation checks visible text; it does not specifically select an `h1` element.

## Configuration explained

### Cypress configuration

`cypress.config.cjs` uses CommonJS (`require` and `module.exports`) and exports its settings through Cypress's `defineConfig()` helper.

The E2E spec pattern is:

```js
specPattern: "cypress/e2e/**/*.feature";
```

This discovers `.feature` files under `cypress/e2e`, including subdirectories. JavaScript files such as `example.js` provide step implementations; they are not separate test specs. Ordinary `.cy.js` files are also excluded by this pattern.

The asynchronous `setupNodeEvents(on, config)` function connects the integrations in three steps:

1. `await addCucumberPreprocessorPlugin(on, config)` registers the Cucumber integration.
2. `on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }))` registers the esbuild bundler with Cucumber support.
3. `return config` preserves the resulting configuration for Cypress.

Together, these settings let Cypress discover a feature, load its step definitions, bundle the test, and execute it in a browser.

### Step-definition mapping

`.cypress-cucumber-preprocessorrc.json` contains:

```json
{
  "stepDefinitions": ["cypress/e2e/[filepath].js"]
}
```

`[filepath]` represents the feature path relative to the integration folder inferred by the preprocessor, without the `.feature` extension. With the current layout, `example.feature` resolves to `cypress/e2e/example.js`.

For a new feature directly inside `cypress/e2e`, create a JavaScript file with the same base name. For example, `navigation.feature` pairs with `navigation.js`. Step definitions in unrelated JavaScript files are not automatically shared by this configuration. If you reorganize features into subdirectories or introduce shared steps, review the mapping as part of that change.

## Adding a feature

The following is an example you can add; these two files are not included in the current repository.

1. Create `cypress/e2e/navigation.feature`:

   ```gherkin
   Feature: Example site navigation

     Scenario: View the home page introduction
       Given I visit the Cypress example site
       Then I should see the text "Kitchen Sink"
   ```

2. Create `cypress/e2e/navigation.js`:

   ```js
   import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

   Given("I visit the Cypress example site", () => {
     cy.visit("https://example.cypress.io");
   });

   Then("I should see the text {string}", (text) => {
     cy.contains(text).should("be.visible");
   });
   ```

   `{string}` is a Cucumber expression parameter. It passes the quoted value from the feature into the callback, so the same definition can check different text values within this feature.

3. Run the new feature:

   ```sh
   npm run cy:run -- --spec "cypress/e2e/navigation.feature"
   ```

Keep scenarios focused on observable behavior. Put browser commands in step definitions, and make assertions specific enough to identify the expected result.

## Support files and fixtures

`cypress/support/e2e.js` is loaded before each spec and imports `commands.js`. Use the support file for setup or hooks that genuinely apply across the test suite.

`cypress/support/commands.js` currently contains commented examples only. Add reusable Cypress commands here when several tests need the same browser operation.

`cypress/fixtures/example.json` contains sample data with `name`, `email`, and `body` fields. The included scenario does not use it. A step definition can load it with:

```js
cy.fixture("example").then((data) => {
  expect(data.email).to.equal("hello@cypress.io");
});
```

Fixtures are useful for reusable test inputs or mocked responses. Loading a fixture alone does not mock a network request; a test must explicitly connect the data to its setup, such as with `cy.intercept()`.

## Testing another application

The current step definition visits an absolute URL, and `baseUrl` is not configured. To target your own application, change the URL in the step definition, or add a `baseUrl` property inside the existing `e2e` configuration:

```js
baseUrl: "http://localhost:3000",
```

Then change the relevant navigation command to:

```js
cy.visit("/");
```

Setting `baseUrl` does not replace the absolute URL already used by the example; update the step as well. Start your application separately before running Cypress, and adapt the assertions to its content.

## Troubleshooting

| Symptom                                        | What to check                                                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` fails immediately                   | This is the placeholder script. Run `npm run cy:run`.                                                                            |
| No specs are found                             | Run from the project root and check that the file ends in `.feature` and is inside `cypress/e2e`.                                |
| A step implementation is missing               | Check the feature text against the registered expression, the JavaScript filename, and the `stepDefinitions` mapping.            |
| A `.cy.js` test does not appear                | The current `specPattern` only includes `.feature` files. Change the pattern if you intentionally add another spec format.       |
| Cypress reports an unsupported Node.js version | Check `node --version` against the installed Cypress package's Node.js requirements.                                             |
| The Cypress executable is missing              | Run `npx cypress install`, then `npx cypress verify`. These commands may need network access or access to Cypress's local cache. |
| The example page does not load                 | Check access to `https://example.cypress.io`, including any proxy or firewall configuration.                                     |
| The visibility assertion fails                 | Inspect the browser and command log in interactive mode. Confirm that the page still contains visible `Kitchen Sink` text.       |
| Chrome cannot be found                         | Install Chrome or run without `--browser chrome` to use the bundled Electron browser.                                            |

## Current scope

The repository includes one feature, one scenario, and two step definitions. There is no custom report configuration, CI workflow, application startup script, lint script, or build script. The fixture and custom-command examples are available for future tests but are not used by the included scenario.

For a future CI workflow, install dependencies with `npm ci` and execute `npm run cy:run` in an environment that supports Cypress. The current scenario requires access to the public example website.

## License

`package.json` declares the project license as **ISC**. A separate `LICENSE` file is not currently included.
