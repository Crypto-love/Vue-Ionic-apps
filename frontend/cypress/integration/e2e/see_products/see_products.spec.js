import { base } from 'src/config';

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given('we go to login page', () => {
  cy.device();
});

When(`we type in {string} and {string} as credential`, (email, password) => {
  const host = location.host.split('.')[0];
  if (email === 'test_auto_admin_01@thetreedots.com' && host === 'dashboard')
    password = 'TanyaAjaOrangBatam2020';
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

Given(`we go to products page`, () => {
  /**
   * Go to Dashboard products page
   */
  cy.visit(`${base}/main/b2b/products`);
  cy.wait(2000);
});

when(`we are in products page`, () => {
  /**
   * Confirm if we already in Dashboard products page
   */
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/b2b/products');
  });
});

Then(`then it should show list of products`, () => {
  /**
   * Confirm if list of products DOM is rendered by Node
   */
  cy.wait(2000);
  cy.get('.q-table__grid-content').should('exist');
});

Then(`then it should show list of products with minimum 1 product`, () => {
  /**
   * Confirm if the rendered list of products have product(s) in the list.
   * Need to wait for 2secs to make sure the list is loaded properly.
   */
  cy.wait(2000);
  cy.get('.q-table__grid-content').should('exist');
  cy.get('.q-table__grid-content').children().should('have.length.gte', 1);
});
