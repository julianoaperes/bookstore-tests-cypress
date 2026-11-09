Feature: Book categories API
  As an API consumer
  I want to retrieve book categories
  So that the catalog offers accurate category filters

  Scenario: Retrieve categories successfully
    When I request the book categories
    Then the categories API status should be 200
    Then the categories API should return JSON
    Then the categories response should have a valid structure

  Scenario: Return unique category names
    When I request the book categories
    Then the categories API status should be 200
    Then the category names should be unique

  Scenario: Return a total matching the category collection
    When I request the book categories
    Then the categories API status should be 200
    Then the categories total should match the collection size

  Scenario: Preserve accented category names
    When I request the book categories
    Then the categories API status should be 200
    Then the categories should include these names:
      | name            |
      | Estratégia      |
      | Ficção          |
      | Ficção Clássica  |
      | Realismo Mágico  |

  Scenario: Exclude História from the current sample categories
    When I request the book categories
    Then the categories API status should be 200
    Then the categories should not include "História"

  Scenario: Match each category count to the books endpoint
    When I request the book categories
    Then the categories API status should be 200
    Then each category book count should match the books API

  Scenario: Match the sum of category counts to the catalog total
    When I request the book categories
    Then the categories API status should be 200
    Then the sum of category book counts should match the catalog total