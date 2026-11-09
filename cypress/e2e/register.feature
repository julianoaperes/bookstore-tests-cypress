    Feature: Create an account
    As a library visitor
    I want to create an account
    So that I can use the library services

    Background:
    Given I am on the registration page

    Scenario: Display the registration form
    Then I should see the registration fields
    Then the registration password should be hidden
    
    Scenario: Create an account without an optional phone
    When I fill the registration form with a new user
    When I accept the registration terms
    When I submit the registration form
    Then the registration should succeed

    Scenario: Create an account with a phone
    When I fill the registration form with a new user
    When I enter the registration phone "11999999999"
    When I accept the registration terms
    When I submit the registration form
    Then the registration should succeed

    Scenario Outline: Reject an invalid name
    When I fill the registration form with a new user
    When I change the registration field "name" to "<name>"
    When I accept the registration terms
    When I submit the registration form
    Then the registration field "name" should be invalid
    Then I should remain on the registration page

    Examples:
        | name |
        |      |
        | J    |

    Scenario Outline: Reject a missing or invalid email
    When I fill the registration form with a new user
    When I change the registration field "email" to "<email>"
    When I accept the registration terms
    When I submit the registration form
    Then the registration field "email" should be invalid
    Then I should remain on the registration page

    Examples:
        | email           |
        |                 |
        | invalid-email   |
        | user@           |
        | @example.com    |

    Scenario Outline: Reject a password shorter than six characters
    When I fill the registration form with a new user
    When I change the registration field "password" to "<password>"
    When I change the registration field "confirmation" to "<password>"
    When I accept the registration terms
    When I submit the registration form
    Then the registration field "password" should be invalid
    Then I should remain on the registration page

    Examples:
        | password |
        |          |
        | Ab1!x    |

    Scenario: Accept the minimum password length
    When I fill the registration form with a new user
    When I change the registration field "password" to "Ab12!x"
    When I change the registration field "confirmation" to "Ab12!x"
    When I accept the registration terms
    When I submit the registration form
    Then the registration should succeed

    Scenario Outline: Reject an empty or different password confirmation
    When I fill the registration form with a new user
    When I change the registration field "confirmation" to "<confirmation>"
    When I accept the registration terms
    When I submit the registration form
    Then the registration field "confirmation" should be invalid
    Then I should remain on the registration page

    Examples:
        | confirmation |
        |              |
        | Different1!  |

    Scenario: Reject registration without accepting the terms
    When I fill the registration form with a new user
    When I submit the registration form
    Then the registration field "terms" should be invalid
    Then I should remain on the registration page

    Scenario: Reject an empty registration form
    When I submit the registration form
    Then the registration field "name" should be invalid
    Then the registration field "email" should be invalid
    Then the registration field "password" should be invalid
    Then the registration field "terms" should be invalid
    Then I should remain on the registration page

    Scenario: Show and hide the password without changing its value
    When I change the registration field "password" to "Example123!"
    When I toggle the registration password visibility
    Then the registration password should be visible
    Then the registration password should contain "Example123!"
    When I toggle the registration password visibility
    Then the registration password should be hidden
    Then the registration password should contain "Example123!"

    Scenario: Correct an invalid email
    When I fill the registration form with a new user
    When I change the registration field "email" to "invalid-email"
    When I submit the registration form
    Then the registration field "email" should be invalid
    When I restore the new user's registration email
    When I accept the registration terms
    When I submit the registration form
    Then the registration should succeed
   
    Scenario: Prevent registration with an already registered email
    When I fill the registration form with a new user
    When I accept the registration terms
    When I submit the registration form
    Then the registration should succeed
    Given I am on the registration page
    When I fill the registration form with the same user
    When I accept the registration terms
    When I submit the registration form
    Then I should see a duplicate registration email error

    Scenario: Navigate to login
    When I click the registration link "Fazer Login"
    Then I should reach the login page from registration

    Scenario: Navigate to the catalog
    When I click the registration link "Voltar ao Catálogo"
    Then I should reach the catalog page from registration