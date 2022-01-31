import { base } from 'src/config';

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import dayjs from 'dayjs';

Given('i go to login page', () => {
  cy.device();
});

When(`i type admin's credential; email = {string} and password = {string}`, (email, password) => {
  /** simulate input */

  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('.btn_login').click();

  /** wait for backend response and stuff */
  cy.wait(2000);
});

Then(`it should redirect to Dashboard`, () => {
  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/dashboard');
  });
});

// We will check here whether there are orders for current date or not
// Why ? read this section: https://docs.cypress.io/guides/core-concepts/conditional-testing.html#Welcome-wizard
Given('i go to order page', () => {
  cy.visit(base + '/main/b2b/orders');
});

When('i click create new order Button', () => {
  cy.get('[data-cy=create-order-btn]').click();
});

And('i click create new order Button', () => {
  cy.get('[data-cy=create-order-btn]').click();
});

Then('it should display Create Order Form Dialog', () => {
  cy.wait(2000);
  cy.get('[data-cy=create-order-form]').should('be.visible');
});

And('i click on choose customer', () => {
  cy.get('[data-cy=choose-customer]').click();
});

And('i type in {string}', (customerName) => {
  cy.get('[data-cy=search-customer-by-name]').type(customerName);
});

And('i click customer named {string}', (customerName) => {
  cy.get('[data-cy=customer-list]').contains(customerName).click();
});

And('i set the delivery date to today', () => {
  const today = dayjs().format('YYYY/MM/DD');
  cy.get('[data-cy=delivery-date]').click();
  cy.get('[data-cy=delivery-date]').click();
  cy.get('[data-cy=delivery-date]').type(today);
});

And('i check on separate invoice', () => {
  cy.get('[data-cy=separate-invoice]').click();
});

And('i type in {string} on remarks', (remark) => {
  cy.get('[data-cy=remark]').type(remark);
});

And('i click Add Product button', () => {
  cy.get('[data-cy=add-product]').click();
});

And('i type in {string} when searching product', (productName) => {
  cy.get('[data-cy=search-product]').type(productName);
});

And('i check all product on the table', () => {
  cy.get('[data-cy=product-table] table tbody > tr', { timeout: 60000 }); // Wait for this element to appear first (timeout = 1 minute)
  cy.get('[data-cy=product-table] table thead > tr > .q-table--col-auto-width > .q-checkbox').click();
});

And('i click Save product button', () => {
  cy.get('[data-cy=product-save-btn]').click();
});

When('i click save order button', () => {
  cy.get('[data-cy=submit-order]').click();

  // If today Order exist, then dialog will popup... then we should click "yes" for the form to be submitted

  cy.wait(5000);

  cy.get('body')
    .then(($body) => {
      if ($body.find('[data-cy=confirm-message-ok-btn]').length > 0) {
        //evaluates as true
        cy.get('[data-cy=confirm-message-ok-btn]').click();
      }
    })
    .then(() => {
      /** Wait until sending order is completed */
      cy.wait(2000);
    });
});

Then('the form will be closed', () => {
  cy.get('[data-cy=create-order-form]').should('not.exist');
});
