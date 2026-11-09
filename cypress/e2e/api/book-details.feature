Feature: Book details API
  As an API consumer
  I want to retrieve a specific book
  So that I can display its details and availability

  Scenario: Retrieve a book successfully
    When I request book details for ID "2"
    Then the book details API status should be 200
    Then the book details API should return JSON
    Then the returned book should have ID 2 and title "1984"
    Then the book details response should have a valid structure

  Scenario: Return consistent availability information
    When I request book details for ID "2"
    Then the book details API status should be 200
    Then the book details availability should be consistent

  Scenario: Return consistent statistics
    When I request book details for ID "2"
    Then the book details API status should be 200
    Then the book details statistics should be consistent

  Scenario: Return an error for a nonexistent book
    When I request book details for ID "2147483647"
    Then the book details API status should be 404
    Then the book details API message should be "Livro não encontrado."
    Then the book details API should not return a book

  Scenario: Return an error for a nonnumeric ID
    When I request book details for ID "abc"
    Then the book details API status should be 400
    Then the book details API message should be "ID do livro inválido."
    Then the book details API should not return a book