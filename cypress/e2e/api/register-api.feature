Feature: Registration API
  As a library visitor
  I want to create an account
  So that I can authenticate and use the library

  Scenario: Register without an optional phone
    Given I have a new API registration user
    When I submit the user to the registration API
    Then the registration API status should be 201
    Then the registration API should return JSON
    When I log in through the API using the new registration credentials
    Then the new registration login status should be 200
    Then the new registration login should return a token

  Scenario: Register with a phone
    Given I have a new API registration user
    When I set the API registration field "phone" to "11999999999"
    When I submit the user to the registration API
    Then the registration API status should be 201
    When I log in through the API using the new registration credentials
    Then the new registration login status should be 200
    Then the new registration login should return a token

  Scenario: Reject a duplicate email
    Given I have a new API registration user
    When I submit the user to the registration API
    Then the registration API status should be 201
    When I submit the user to the registration API
    Then the registration API status should be 409
    Then the registration API should return JSON
    Then the registration API should return an error message

  Scenario Outline: Reject empty required fields
    Given I have a new API registration user
    When I set the API registration field "<field>" to ""
    When I submit the user to the registration API
    Then the registration API status should be 400
    Then the registration API should return an error message

    Examples:
      | field    |
      | name     |
      | email    |
      | password |

  Scenario Outline: Reject omitted required fields
    Given I have a new API registration user
    When I omit the API registration field "<field>"
    When I submit the user to the registration API
    Then the registration API status should be 400
    Then the registration API should return an error message

    Examples:
      | field    |
      | name     |
      | email    |
      | password |