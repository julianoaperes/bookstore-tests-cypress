Feature: Login API
  As a registered user
  I want to authenticate
  So that I can access protected features

  Scenario: Authenticate with valid credentials
    Given I have registered test account credentials
    When I authenticate through the login API
    Then the login API status should be 200
    Then the login API should return JSON
    Then the login API should return an authentication token

  Scenario: Reject an incorrect password
    Given I have registered test account credentials
    When I authenticate through the login API with an incorrect password
    Then the login API status should be 401
    Then the login API should return JSON
    Then the login API should not return an authentication token

  Scenario: Reject an unregistered email
    When I request API login with email "unregistered-qa-user-98765@example.com" and password "Example123!"
    Then the login API status should be 401
    Then the login API should not return an authentication token

  Scenario Outline: Reject empty credentials
    When I request API login with email "<email>" and password "<password>"
    Then the login API status should be 400
    Then the login API should not return an authentication token

    Examples:
      | email           | password    |
      |                 | Example123! |
      | qa@example.com  |             |
      |                 |             |

  Scenario Outline: Reject omitted credential fields
    When I request API login omitting "<field>"
    Then the login API status should be 400
    Then the login API should not return an authentication token

    Examples:
      | field    |
      | email    |
      | password |
      | both     |