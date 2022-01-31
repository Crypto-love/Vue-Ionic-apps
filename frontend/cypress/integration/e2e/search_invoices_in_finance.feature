Feature: b2b_order

  As a tenant admin, i can search by customer name or invoice number on finance

  Background:
    Given i go to login page
    When i type admin's credential
    Then it should redirect to Dashboard

  Scenario: Search invoice by customer name
    Given i go to finance invoices page
    When i click searchbar
    And type invoice's name
    Then it should display invoice with that data

  Scenario: Search invoice by invoice number
    Given i go to finance invoices page
    When i click searchbar
    And type invoice's number
    Then it should display invoice with that data
