Feature: Catalog API integration
  As an API consumer
  I want consistent category, catalog, and book details data
  So that the application displays reliable information

  Scenario: Retrieve a book through its category and verify its details
    When I retrieve a populated category through the API
    When I retrieve a book from that API category
    Then the filtered books total should match the selected category
    When I retrieve the selected book details through the API
    Then the book details should match the catalog record
    Then the book details category should match the selected category