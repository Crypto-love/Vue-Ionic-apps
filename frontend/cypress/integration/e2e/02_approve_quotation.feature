Feature: Approve quotation request

  Sales or Admin can approve quotation request from buyer

  # Sales login from iOs and using email

  Scenario Outline: Login Sales with email
    Given we go to login page on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we select company list
    Then we go to home page on "<home_path>"
    Examples:
      | os  | email                    | password       | path                   | home_path        |
      | ios | nicholas@thetreedots.com | Nicholas10305! | /sales/select-customer | /main/sales/home |

  Scenario Outline: Approve request quotation success from Sales
    Given we go to home page on "<home_path>"
    When we click notification icon button and redirect to "<notification_path>"
    And we chose quotation tab menu on "<quotation_path>"
    And click Item or Take Action button with "<product_name>" and view detail product
    And put in price $ "<price>", for example and click send button to approve
    Then we look Approved succes dialog

    # for select item product with requested status, we need to send request first from buyer account
    # and then request quotation product can show on Sales or admin Quotation Notification

    Examples:
      | home_path        | notification_path                     | quotation_path                      | product_name          | price |
      | /main/sales/home | /main/sales/notification/transactions | /main/sales/notification/quotations | Cauliflower | 18    |

  Scenario Outline: Approve request quotation Failed from Sales
    Given we go back to quotation page on "<quotation_path>"
    When click Item or Take Action button with "<product_name>" and view detail product
    And put in price $ "<price>", for example and click send button to approve
    Then we look Approved failed dialog

    # for select item product with requested status, we need to send request first from buyer account
    # and then request quotation product can show on Sales or admin Quotation Notification

    Examples:
      | quotation_path                      | product_name | price |
      | /main/sales/notification/quotations | Sweet Corn    | -18   |

  #Admin login from Android and using mobile phone

  @tag-to-include
  Scenario Outline: Login Admin with mobile
    Given we go to login page on "<os>"
    When we click email button
    And key in "<email>" and "<password>" for email method
    And app path is "<path>"
    And we select company list
    Then we go to home page on "<home_path>"

    # for select item product with requested status, we need to send request first from buyer account
    # and then request quotation product can show on Sales or admin Quotation Notification

    Examples:
      | os      | email                 | password    | path                   | home_path        |
      | android | admin@thetreedots.com | qwe*asd*ZXC | /admin/select-customer | /main/admin/home |

  Scenario Outline: Approve request quotation success from Admin
    Given we go to home page on "<home_path>"
    When we click notification icon button and redirect to "<notification_path>"
    And we chose quotation tab menu on "<quotation_path>"
    And click Item or Take Action button with "<product_name>" and view detail product
    And put in price $ "<price>", for example and click send button to approve
    Then we look Approved succes dialog

    # for select item product with requested status, we need to send request first from buyer account
    # and then request quotation product can show on Sales or admin Quotation Notification

    Examples:
      | home_path        | notification_path                     | quotation_path                      | product_name | price |
      | /main/admin/home | /main/admin/notification/transactions | /main/admin/notification/quotations | Asari Clam   | 12    |

  Scenario Outline: Approve request quotation Failed from Admin
    Given we go back to quotation page on "<quotation_path>"
    When click Item or Take Action button with "<product_name>" and view detail product
    And put in price $ "<price>", for example and click send button to approve
    Then we look Approved failed dialog

    # for select item product with requested status, we need to send request first from buyer account
    # and then request quotation product can show on Sales or admin Quotation Notification

    Examples:
      | quotation_path                      | product_name | price |
      | /main/admin/notification/quotations | Beef Lung    | -18   |
