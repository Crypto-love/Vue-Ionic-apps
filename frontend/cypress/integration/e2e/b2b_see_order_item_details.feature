Feature: b2b_see_order_item_details

  As a b2b buyer, we can see details of order's item in mobile app

  Scenario Outline: we can see order item's details by click detail button
    Given we go to login on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we select company list
    And we go to orders page
    And then it should show list of orders
    And we can click one of the order in the list
    And we can click detail button to show details
    Then order item details show up
    Examples:
    |os|email|password|path|
    |android|test_auto_buyer_b2b_01@thetreedots.com|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|
    |ios|test_auto_buyer_b2b_01@thetreedots.com|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|
