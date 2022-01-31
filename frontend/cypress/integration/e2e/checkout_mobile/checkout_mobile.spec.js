import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps';
/**
 * BACKGROUND
 */
Given('i go to login page', () => {
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });

  cy.device('/login', 'android');
  cy.wait(250);
  /** skip intro */
  cy.get('#btnSkip').click();
  cy.wait(250);
});

When(`i type in {string} and {string} as credential`, (email, password) => {
  /** Sign in with email */
  cy.get('#btnEmail').click();
  cy.wait(250);

  cy.location()
    .then((location) => {
      const host = location.host.split('.')[0];

      if (email == 'test_auto_sales_01@thetreedots.com' && host == 'dashboard')
        password = 'TanyaAjaOrangBatam2020';
      else if (email == 'test_auto_admin_01@thetreedots.com' && host == 'dashboard')
        password = 'TanyaAjaOrangBatam2020';

      /** simulate input */
      cy.get('.txt-username').type(email);
      cy.get('.txt-password').type(password);

      /** simulate click */
      cy.get('#btnLogin').click();

      /** wait for backend response and stuff */
    })
    .wait(2000);
});

Then(`I should see Select Customer page for {string} and choose {string}`, (userType, customer) => {
  /** Wait for fetching customer data */
  cy.wait(2000);

  cy.location().then((location) => {
    /** If user is tagged more than one customer, we should choose one customer  */
    if (location.pathname == `/${userType}/select-customer`) {
      cy.get('[data-cy=search]').type(customer);

      cy.get(`[data-cy=customer_${customer.replace(/ /g, '_')}]`).click();

      cy.get('body')
        .then(($body) => {
          if ($body.find('[data-cy=parent-company]').length > 0) {
            //evaluates as true
            cy.get('[data-cy=parent-company]').click();
          }
        })
        .then(() => {
          cy.wait(1000)
            .location()
            .then((loc) => {
              expect(loc.pathname).to.eq(`/main/${userType}/home`);
            });
        });

      /* cy.wait(1000).location().then((loc) => {
				expect(loc.pathname).to.eq(`/main/${userType}/home`);
			}) */
    } else {
      /** If user is tagged only one customer, it should be redirected to Home Page */
      expect(location.pathname).to.eq(`/main/${userType}/home`);
    }
  });
});

/**
 * SCENARIO
 */
When(`We tap on Cart on Bottom Navigation`, () => {
  cy.get('[data-cy=Cart]').click();
});

Then(`It should open Cart page for {string}`, (userType) => {
  cy.location().should((location) => {
    expect(location.pathname).to.eq(`/main/${userType}/action`);
  });
});

And(`We should see image and message about empty shopping cart`, () => {
  cy.get('[data-cy=empty-cart]').should('be.visible');
});

Given(
  `We are looking for product named {string} from tenant {string}. Once found, add to cart`,
  (product_name, tenant) => {
    /** Search product */
    cy.get('[data-cy=search]').type(product_name);

    /** Wait until product and sku is fetched */
    cy.wait(2000);

    /** Tap on product */
    cy.get('[data-cy=products]').contains(tenant).click();

    /** Choose available sku by loop each spec */
    cy.get('[data-cy=variations]').each(($element, index, $list) => {
      /** If each spec has multiple variant, then select first variant  */
      /** Need future improvement to loop each variant and then select available variant */
      if ($list[index].children.length > 1) $list[index].firstChild.firstChild.click();
    });

    /** Tap Add to Cart button to add SKU to Cart */
    cy.get('[data-cy=add-to-cart').click();
  }
);

Then(`We should see one item and button Continue to Order`, () => {
  /** Check if products length in Cart */
  cy.get('[data-cy=products]').children().should('have.length', 1);

  /** Check if `Continue` button is visible then tap on it */
  cy.get('[data-cy=btn-continue-to-order]').should('be.visible').click();

  /** Check if `Order` button is visible */
  cy.get('[data-cy=btn-order-now]').should('be.visible');
});

And(`We place an order`, () => {
  /** Place an order */
  cy.get('[data-cy=btn-order-now]').should('be.visible').click();

  /** Confirm place order */
  cy.get('.q-dialog').should('be.visible');
  cy.get('[data-cy=btn-yes]').should('be.visible').click();

  /** Wait for combine order dialog */
  cy.wait(2000);

  /** Close combine order dialog if exist. (Usually happen for Admin and Sales) */
  cy.get('body')
    .then(($body) => {
      if ($body.find('[data-cy=btn-no]').length > 0) {
        //evaluates as true
        cy.get('[data-cy=btn-no]').click();
      }
    })
    .then(() => {
      /** Wait until sending order is completed */
      cy.wait(2000);

      /** Success order pop up should be visible */
      cy.get('.q-dialog').should('be.visible');
      cy.get('[data-cy=alert-title]').contains('Success');
    });
});

And(`Cart should be empty after order is placed`, () => {
  /** Close the dialog */
  cy.get('[data-cy=alert-button]').click();

  cy.get('[data-cy=empty-cart]').should('be.visible');
});
