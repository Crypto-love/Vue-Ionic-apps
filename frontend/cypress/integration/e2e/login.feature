Feature: login

  login functionality

  Scenario Outline:  
    Given we go to login
    When key in "<email>" and "<password>"
    Then app path is "<path>"
    Examples:
    |email|password|path|				
    |notexist@email.com|4293|/login|
    |test_auto_admin_01@thetreedots.com|123|/login|
    |test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/main/dashboard|