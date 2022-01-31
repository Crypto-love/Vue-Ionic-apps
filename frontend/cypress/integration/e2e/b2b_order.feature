Feature: b2b_order

  As a tenant admin, i can create order for my b2b customers

  Background: 
    Given i go to login page
    When i type admin's credential; email = "test_auto_admin_01@thetreedots.com" and password = "TanyaAjaOrangBatam2020"
    Then it should redirect to Dashboard

  Scenario: Clicking "Create New Order" Button  
    Given i go to order page
    When i click create new order Button
    Then it should display Create Order Form Dialog

  Scenario: Input and Submit Form Data (customer = lalala test) = Successful
    Given i go to order page
    * i click create new order Button
    * i click on choose customer
    * i type in "lala"
    * i click customer named "Lalala test"
    * i set the delivery date to today
    * i check on separate invoice
    * i type in "CYPRESS TEST GOES BRRRRRRR" on remarks
    * i click Add Product button
    * i type in "cauli" when searching product
    * i check all product on the table
    * i click Save product button
    When i click save order button
    Then the form will be closed
