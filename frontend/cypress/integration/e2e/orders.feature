Feature: Orders

    Orders functionality

    Scenario Outline: 
    Given we go to login
    When key in "<email>" and "<password>"
    Then app path is "<path>"
    Examples:
    |email|password|path|
    |test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/main/dashboard|