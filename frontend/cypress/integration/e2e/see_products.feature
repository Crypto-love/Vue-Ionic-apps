Feature: see_products

  As a tenant admin, we can see products of all category in dashboard

  Background:
    Given we go to login page
    When we type in "test_auto_admin_01@thetreedots.com" and "TanyaAjaOrangBatam2020" as credential
    Then it should redirect to Dashboard

  Scenario: clicking All Products/SKUS in navigation menu we go to products page
    Given we go to products page
    When we are in products page
    Then then it should show list of products

  Scenario: products page should have one product in the list of products
    Given we go to products page
    When we are in products page
    Then then it should show list of products with minimum 1 product
