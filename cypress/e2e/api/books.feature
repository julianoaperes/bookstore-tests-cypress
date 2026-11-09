Feature: Books API
  As an API consumer
  I want to retrieve and filter books
  So that the catalog displays the correct information

    Scenario: Retrieve books successfully
    When I request books with these query parameters:
        | page  | 1  |
        | limit | 12 |
    Then the books API status should be 200
    Then the books API should return JSON
    Then the books API response should have a valid structure
    Then the books API pagination should be consistent

    Scenario Outline: Respect the requested page size
    When I request books with these query parameters:
        | page  | 1       |
        | limit | <limit> |
    Then the books API status should be 200
    Then the books API should return <limit> books
    Then the books API pagination should be consistent

    Examples:
        | limit |
        | 1     |
        | 5     |
        | 12    |

    Scenario Outline: Search by title, partial title, author, or ISBN
    When I request books with these query parameters:
        | search | <search> |
        | limit  | 100      |
    Then the books API status should be 200
    Then the books API should return exactly these titles:
        | title   |
        | <title> |

    Examples:
        | search           | title        |
        | 1984             | 1984         |
        | Casmurro         | Dom Casmurro |
        | Machado de Assis | Dom Casmurro |
        | 978-0-452-28423-4 | 1984         |

    Scenario: Search for an author with multiple books
    When I request books with these query parameters:
        | search | George Orwell |
        | limit  | 100           |
    Then the books API status should be 200
    Then the books API should return exactly these titles:
        | title                  |
        | 1984                   |
        | A Revolução dos Bichos |

    Scenario Outline: Search without case sensitivity
    When I request books with these query parameters:
        | search | <search> |
    Then the books API status should be 200
    Then the books API should return exactly these titles:
        | title        |
        | Dom Casmurro |

    Examples:
        | search       |
        | dom casmurro |
        | DOM CASMURRO |

    Scenario: Return an empty collection for an unmatched search
    When I request books with these query parameters:
        | search | qa-book-that-does-not-exist-98765 |
    Then the books API status should be 200
    Then the books API should return an empty collection

    Scenario: Filter books by category
    When I request books with these query parameters:
        | category | Fantasia |
        | limit    | 100      |
    Then the books API status should be 200
    Then every returned book should have "category" equal to "Fantasia"
    Then the books API should return 5 books

    Scenario: Filter books by publisher
    When I request books with these query parameters:
        | editor | Editora Exemplo |
        | limit  | 100             |
    Then the books API status should be 200
    Then every returned book should have "editor" equal to "Editora Exemplo"
    Then the books API should return exactly these titles:
        | title          |
        | Hub de Leitura |

    Scenario: Return only available books
    When I request books with these query parameters:
        | available | true |
        | limit     | 100  |
    Then the books API status should be 200
    Then every returned book should have available copies

    Scenario: Return no unavailable books in the current sample catalog
    When I request books with these query parameters:
        | available | false |
    Then the books API status should be 200
    Then the books API should return an empty collection

    Scenario: Combine compatible filters
    When I request books with these query parameters:
        | search    | 1984                     |
        | category  | Ficção                   |
        | editor    | Companhia das Letras     |
        | available | true                     |
    Then the books API status should be 200
    Then the books API should return exactly these titles:
        | title |
        | 1984  |
    Then every returned book should have "category" equal to "Ficção"
    Then every returned book should have "editor" equal to "Companhia das Letras"
    Then every returned book should have available copies

    Scenario: Return no books for incompatible filters
    When I request books with these query parameters:
        | search   | 1984     |
        | category | Fantasia |
    Then the books API status should be 200
    Then the books API should return an empty collection

    Scenario: Return no books for the História category
    When I request books with these query parameters:
        | category | História |
    Then the books API status should be 200
    Then the books API should return an empty collection

    Scenario: Return different books on consecutive pages
    When I request books with these query parameters:
        | page  | 1 |
        | limit | 5 |
    Then the books API status should be 200
    Then the books API pagination should be consistent
    When I save the returned book IDs
    When I request books with these query parameters:
        | page  | 2 |
        | limit | 5 |
    Then the books API status should be 200
    Then the books API should return 5 books
    Then the books API current page should be 2
    Then the books API pagination should be consistent
    Then the returned books should not repeat the saved IDs