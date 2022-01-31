Feature: mobile login

  login functionality on mobile

  Scenario Outline: via email
    Given we go to login on "<os>"
    When key in "<email>" and "<password>" for email method    
    Then app path is "<path>"
    Examples:
    |os|email|password|path|
    |android|test_auto_admin_01@thetreedots.com|123|/login|
    |android|test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/main/dashboard|
    |ios|test_auto_admin_01@thetreedots.com|123|/login|
    |ios|test_auto_admin_01@thetreedots.com|TanyaAjaOrangBatam2020|/main/dashboard|