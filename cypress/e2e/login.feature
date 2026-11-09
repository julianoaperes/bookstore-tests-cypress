
Feature: Login 
Background:
    Given I am on the login page

    Scenario: Should login successfully
        When I type the email "jp.teste@teste.com"
        When I type the password "123456"
        When I click on the submit button
        Then I should be logged in successfully

    Scenario: Should reject an incorrect password
        When I type the email "usuario@teste.com"
        When I type the password "WrongPassword123!"
        When I click on the submit button
        Then I should see the login error "Email ou senha incorretos."
        Then I should remain on the login page

    Scenario: Should reject an unregistered email
        When I type the email "nonexistent-login-user@example.invalid"
        When I type the password "user123"
        When I click on the submit button
        Then I should see the login error "Email ou senha incorretos."
        Then I should remain on the login page

    Scenario: Should reject incorrect email and password
        When I type the email "nonexistent-login-user@example.invalid"
        When I type the password "WrongPassword123!"
        When I click on the submit button
        Then I should see the login error "Email ou senha incorretos."
        Then I should remain on the login page

    Scenario: Should require an email
        When I type the password "user123"
        When I click on the submit button
        Then the email field should be required
        Then I should remain on the login page

    Scenario: Should require a password
        When I type the email "usuario@teste.com"
        When I click on the submit button
        Then the password field should be required
        Then I should remain on the login page

    Scenario: Should require both email and password
        When I click on the submit button
        Then the email field should be required
        Then the password field should be required
        Then I should remain on the login page

    Scenario Outline: Should reject an invalid email format
        When I type the email "<email>"
        When I type the password "user123"
        When I click on the submit button
        Then the email field should have an invalid format
        Then I should remain on the login page

        Examples:
        | email             |
        | invalid-email     |
        | usuario@          |
        | usuario teste.com |