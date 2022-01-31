Feature: see_products_mobile

  As a customer or admin, we can see products of all category in mobile apps

  Scenario Outline: admin via email
    Given we go to login page on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we select company list
    And we go to all product tab on "<home_path>"
    Then make sure list of product is exist with minimum 1 product
    Examples:
    |os|email|password|path|home_path|
    |android|test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/admin/select-customer|/main/admin/home|
    |ios|test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/admin/select-customer|/main/admin/home|

#    Removed temporary until OTP for mobile number is covered by the test
#  @tag-to-include
#  Scenario Outline: admin via mobile
#    Given we go to login page on "<os>"
#    When we click phone button
#    And key in "<phone>" and "<password>" for phone method
#    And app path is "<path>"
#    And we select company list
#    And we go to all product tab on "<home_path>"
#    Then make sure list of product is exist with minimum 1 product
#    Examples:
#    |os|phone|password|path|home_path|
#    |android|100010010001|TanyaAjaOrangBatam2020|/admin/select-customer|/main/admin/home|
#    |ios|100010010001|TanyaAjaOrangBatam2020|/admin/select-customer|/main/admin/home|

  Scenario Outline: b2b via email - without branch
    Given we go to login page on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we go to all product tab on "<home_path>"
    Then make sure list of product is exist with minimum 1 product
    Examples:
      |os|email|password|path|home_path|
      |android|test_auto_buyer_b2b_05@thetreedots.com|TanyaAjaOrangBatam2020|/main/buyer_b2b/home|/main/buyer_b2b/home|
      |ios|test_auto_buyer_b2b_05@thetreedots.com|TanyaAjaOrangBatam2020|/main/buyer_b2b/home|/main/buyer_b2b/home|

#    Removed temporary until OTP for mobile number is covered by the test
#  @tag-to-include
#  Scenario Outline: b2b via mobile - without branch
#    Given we go to login page on "<os>"
#    When we click phone button
#    And key in "<phone>" and "<password>" for phone method
#    And app path is "<path>"
#    And we go to all product tab on "<home_path>"
#    Then make sure list of product is exist with minimum 1 product
#    Examples:
#    |os|phone|password|path|home_path|
#    |android|200110010001|TanyaAjaOrangBatam2020|/main/buyer_b2b/home|/main/buyer_b2b/home|
#    |ios|200110010001|TanyaAjaOrangBatam2020|/main/buyer_b2b/home|/main/buyer_b2b/home|

  Scenario Outline: b2b via email - with branch
    Given we go to login page on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we select company list
    And we go to all product tab on "<home_path>"
    Then make sure list of product is exist with minimum 1 product
    Examples:
      |os|email|password|path|home_path|
      |android|test_auto_buyer_b2b_01@thetreedots.com|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|/main/buyer_b2b/home|
      |ios|test_auto_buyer_b2b_01@thetreedots.com|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|/main/buyer_b2b/home|

#    Removed temporary until OTP for mobile number is covered by the test
#  @tag-to-include
#  Scenario Outline: b2b via mobile - with branch
#    Given we go to login page on "<os>"
#    When we click phone button
#    And key in "<phone>" and "<password>" for phone method
#    And app path is "<path>"
#    And we select company list
#    And we go to all product tab on "<home_path>"
#    Then make sure list of product is exist with minimum 1 product
#    Examples:
#      |os|phone|password|path|home_path|
#      |android|200010010001|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|/main/buyer_b2b/home|
#      |ios|200010010001|TanyaAjaOrangBatam2020|/buyer_b2b/select-customer|/main/buyer_b2b/home|
