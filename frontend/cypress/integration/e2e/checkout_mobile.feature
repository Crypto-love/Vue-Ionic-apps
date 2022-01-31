Feature: checkout_mobile

	Mobile checkout functionality

	Scenario Outline: Checkout without item
		Given i go to login page
		When i type in "<username>" and "<password>" as credential
		Then I should see Select Customer page for "<userType>" and choose "<company>"
		When We tap on Cart on Bottom Navigation
		Then It should open Cart page for "<userType>"
		And We should see image and message about empty shopping cart
		Examples:
			| username                               | password               | userType  | company                                    |
			| test_auto_buyer_b2b_01@thetreedots.com | TanyaAjaOrangBatam2020 | buyer_b2b | Customer Automation Testing Developer - 01 |
			| test_auto_admin_01@thetreedots.com     | TanyaAjaOrangBatam2020 | admin     | Customer Automation Testing Developer - 01 |
			| test_auto_sales_01@thetreedots.com     | TanyaAjaOrangBatam2020 | sales     | Customer Automation Testing Developer - 01 |

	Scenario Outline: Checkout with item
		Given i go to login page
		When i type in "<username>" and "<password>" as credential
		Then I should see Select Customer page for "<userType>" and choose "<company>"
		Given We are looking for product named "Cauliflower" from tenant "Admin Tenant Automation Testing Developer - 01". Once found, add to cart
		When We tap on Cart on Bottom Navigation
		Then It should open Cart page for "<userType>"
		And We should see one item and button Continue to Order
		And We place an order
		And Cart should be empty after order is placed
		Examples:
			| username                               | password               | userType  | company                                    |
			| test_auto_buyer_b2b_01@thetreedots.com | TanyaAjaOrangBatam2020 | buyer_b2b | Customer Automation Testing Developer - 01 |
			| test_auto_admin_01@thetreedots.com     | TanyaAjaOrangBatam2020 | admin     | Customer Automation Testing Developer - 01 |
			| test_auto_sales_01@thetreedots.com     | TanyaAjaOrangBatam2020 | sales     | Customer Automation Testing Developer - 01 |