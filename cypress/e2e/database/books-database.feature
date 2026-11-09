Feature: Library database validation
  As a QA engineer
  I want to validate persisted library data
  So that the API and database remain consistent

  Scenario: Verify SQLite database integrity
    When I check the library database integrity
    Then the library database integrity should be valid

  Scenario: Verify the expected application tables
    When I retrieve the library database tables
    Then the library database should contain these tables:
      | name         |
      | Users        |
      | Books        |
      | Contacts     |
      | Reservations |
      | LoanHistory  |
      | Wishlist     |
      | Basket       |
      | BookReviews  |

  Scenario: Verify book stock consistency
    When I query books with invalid database stock
    Then no books should have invalid database stock

  Scenario: Verify foreign key relationships
    When I check the library database foreign keys
    Then the library database should have no foreign key violations

  Scenario: Compare API book details with the database
    When I retrieve book 2 from the API and database
    Then the API book should match its database record

  Scenario: Compare the API catalog total with the database
    When I retrieve the API and database book totals
    Then the API book total should match the database