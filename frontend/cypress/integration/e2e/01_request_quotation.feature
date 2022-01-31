Feature: request_quotation

  Buyer can send Request Quotation to Sales and Admin

  Background: Login using buyer email without branch
    Given we go to login page
    When we click email button
    And key in "test_auto_buyer_b2b_05@thetreedots.com" and "TanyaAjaOrangBatam2020" for email method
    And we redirect to home page
    Then we chose all tab menu

  Scenario Outline: Send request quotation success
    Given we go to home page
    When we chose Item Produk with name is "<product_name>". Once found, it will show product detail
    And we click Request Quotation button
    Then we look Request succes dialog
    Examples:
    |product_name|
    |Cauliflower|
    |Sweet Corn|
    |Asari Clam|
    |Beef Lung|

  Scenario: Check Request Quotation Status
    Given we go to b2b home page and click notofication icon button
    When we tap Quoatation tab menu
    And we can look all of quotation request status
    Then we can tap product item to view detail product
