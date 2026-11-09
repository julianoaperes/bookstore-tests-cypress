Feature: Home page

    Background:
    Given I am on the home page
    
    Scenario: Should display the main home page sections
    Then I should see the home page heading
    Then I should see the main home page sections

    Scenario: Should display featured books
    Then I should see featured books with titles and cover images

    Scenario Outline: Should open the catalog from the home page
    When I click the home button "<button>"
    Then the home navigation should open the catalog

    Examples:
        | button                |
        | Explorar Catálogo     |
        | Ver Catálogo Completo |

    Scenario: Should open the login page from the header
    When I click the home header link "ENTRAR"
    Then the home navigation should open the login page
    
    Scenario Outline: Should open the catalog with the selected category
    When I select the home category "<category>"
    Then the catalog category should be "<category>"

    Examples:
        | category  |
        | Ficção    |
        | Romance   |
        | Biografia |
        | Infantil  |
    
    Scenario: Should display no books found for the História category
    When I select the home category "História"
    Then I should see no books found for the category "História"

    Scenario: Should navigate to the contact section using Help
    When I click the home footer link "Ajuda"
    Then I should reach the home contact section

    Scenario: Should require a name when submitting an empty contact form
    When I submit the home contact form
    Then I should see the home contact error "Por favor, preencha o campo Nome."
    Then I should remain on the home page

    Scenario: Should require a contact email
    When I enter the home contact name "QA Test"
    When I submit the home contact form
    Then I should see the home contact error "Por favor, preencha o campo E-mail."
    Then I should remain on the home page

    Scenario: Should require a contact subject
    When I enter the home contact name "QA Test"
    When I enter the home contact email "qa@example.com"
    When I submit the home contact form
    Then I should see the home contact error "Por favor, selecione o Assunto."
    Then I should remain on the home page

    Scenario: Should require a contact message
    When I enter the home contact name "QA Test"
    When I enter the home contact email "qa@example.com"
    When I select the home contact subject "Sugestões"
    When I submit the home contact form
    Then I should see the home contact error "Por favor, escreva sua Mensagem."
    Then I should remain on the home page

    Scenario Outline: Should reject a malformed contact email
    When I enter the home contact name "QA Test"
    When I enter the home contact email "<email>"
    When I select the home contact subject "Sugestões"
    When I enter the home contact message "Mensagem de teste automatizado."
    When I submit the home contact form
    Then the home contact email should have an invalid format
    Then I should remain on the home page

    Examples:
        | email         |
        | invalid-email |
        | usuario@      |