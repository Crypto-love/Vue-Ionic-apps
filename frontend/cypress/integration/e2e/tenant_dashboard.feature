Feature: b2b_order

  As a tenant admin, i can open dashboard and see my company data

  Background:
    Given i go to login page
    When i type admin's credential
    Then it should redirect to Dashboard

  Scenario: i can see my company data
    Given my company data is loaded
    Then i can see the data in dashboard
