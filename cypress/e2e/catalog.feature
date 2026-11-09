    Feature: Explore the catalog
    As a library visitor
    I want to search and filter books
    So that I can find books and add them to my basket

    Background:
    Given I am on the catalog page

    Scenario: Display the catalog and its controls
    Then I should see the catalog controls
    Then the catalog should display 12 of 23 books
    Then the catalog book cards should contain their information

    Scenario Outline: Search by title, author, or ISBN
    When I search the catalog for "<search>"
    Then the catalog should display these books:
        | title   |
        | <title> |
    Then the catalog should display 1 of 1 books

    Examples:
        | search                | title         |
        | 1984                  | 1984          |
        | Machado de Assis      | Dom Casmurro  |
        | Casmurro              | Dom Casmurro  |

    Scenario: Find multiple books by the same author
    When I search the catalog for "George Orwell"
    Then the catalog should display these books:
        | title                  |
        | 1984                   |
        | A Revolução dos Bichos |
    Then the catalog should display 2 of 2 books

    Scenario Outline: Search without case sensitivity
    When I search the catalog for "<search>"
    Then the catalog should display these books:
        | title        |
        | Dom Casmurro |
    Then the catalog should display 1 of 1 books

    Examples:
        | search       |
        | dom casmurro |
        | DOM CASMURRO |

    Scenario Outline: Display an empty result for an unmatched search
    When I search the catalog for "<search>"
    Then the catalog should display no books

    Examples:
        | search                           |
        | qa-book-that-does-not-exist-98765 |
        | 0000000000000                    |

    Scenario: Restore the catalog after clearing the search
    When I search the catalog for "1984"
    Then the catalog should display 1 of 1 books
    When I clear the catalog search
    Then the catalog should display 12 of 23 books
    
    Scenario: Filter by a category containing one book
    When I select the catalog category "Estratégia"
    Then the catalog category field should display "Estratégia"
    Then the catalog should display these books:
        | title            |
        | A Arte da Guerra |
    Then the catalog should display 1 of 1 books

    Scenario: Filter by a category containing multiple books
    When I select the catalog category "Fantasia"
    Then the catalog should display 5 of 5 books
    Then every catalog book should belong to "Fantasia"
    @only
    Scenario: Filter by publisher
    When I select the catalog publisher "Editora Exemplo"
    Then the catalog publisher should be "Editora Exemplo"
    Then the catalog should display these books:
        | title          |
        | Hub de Leitura |
    Then the catalog should display 1 of 1 books

    Scenario: Display available books
    When I select the catalog availability "Apenas disponíveis"
    Then the catalog should display 12 of 23 books
    Then every displayed catalog book should be available

    Scenario: Display no unavailable books in the current sample catalog
    When I select the catalog availability "Indisponíveis"
    Then the catalog should display no books

    Scenario: Combine search, category, publisher, and availability
    When I search the catalog for "1984"
    When I select the catalog category "Ficção"
    When I select the catalog publisher "Companhia das Letras"
    When I select the catalog availability "Apenas disponíveis"
    Then the catalog should display these books:
        | title |
        | 1984  |
    Then the catalog should display 1 of 1 books

    Scenario: Display no results for incompatible filters
    When I search the catalog for "1984"
    When I select the catalog category "Fantasia"
    Then the catalog should display no books

    Scenario: Remove all active filters
    When I search the catalog for "1984"
    When I select the catalog category "Ficção"
    When I select the catalog publisher "Companhia das Letras"
    When I select the catalog availability "Apenas disponíveis"
    Then the catalog should display 1 of 1 books
    When I remove all catalog filters
    Then the catalog filters should be reset
    Then the catalog should display 12 of 23 books

    Scenario: Display no results for the História category URL
    When I open the catalog with category "História"
    Then the catalog URL category should be "História"
    Then the catalog should display no books

    Scenario: Navigate between catalog pages
    When I open catalog page 2
    Then catalog page 2 should be active
    Then the catalog should display 11 of 23 books
    Then the catalog should not display the book "1984"
    When I open catalog page 1
    Then catalog page 1 should be active
    Then the catalog should display 12 of 23 books
    Then the catalog should display the book "1984"

    Scenario: Reset pagination when searching from the second page
    When I open catalog page 2
    Then catalog page 2 should be active
    When I search the catalog for "1984"
    Then the catalog should display these books:
        | title |
        | 1984  |
    Then the catalog should display 1 of 1 books

    Scenario: Switch between list and grid views
    When I search the catalog for "George Orwell"
    Then the catalog should display 2 of 2 books
    When I switch the catalog to "list" view
    Then the catalog should use "list" view
    Then the catalog should display these books:
        | title                  |
        | 1984                   |
        | A Revolução dos Bichos |
    When I switch the catalog to "grid" view
    Then the catalog should use "grid" view
    Then the catalog should display these books:
        | title                  |
        | 1984                   |
        | A Revolução dos Bichos |

    Scenario: Open book details through its title
    When I open the catalog book "1984" through its title
    Then I should see the details of catalog book "1984" with id "2"

    Scenario: Open book details through its details button
    When I open the details button for catalog book "1984"
    Then I should see the details of catalog book "1984" with id "2"

    Scenario Outline: Add a book to the basket from either view
    When I switch the catalog to "<view>" view
    When I add the catalog book "1984" to the basket
    Then the catalog basket count should be 1
    When I open the basket from the catalog
    Then the basket should contain the catalog book "1984"

    Examples:
        | view |
        | grid |
        | list |

    Scenario: Preserve the basket after reloading
    When I add the catalog book "1984" to the basket
    Then the catalog basket count should be 1
    When I reload the catalog page
    Then the catalog basket count should be 1
    When I open the basket from the catalog
    Then the basket should contain the catalog book "1984"

    Scenario: Add two different books to the basket
    When I add the catalog book "1984" to the basket
    Then the catalog basket count should be 1
    When I add the catalog book "A Arte da Guerra" to the basket
    Then the catalog basket count should be 2
    When I open the basket from the catalog
    Then the basket should contain the catalog book "1984"
    Then the basket should contain the catalog book "A Arte da Guerra"