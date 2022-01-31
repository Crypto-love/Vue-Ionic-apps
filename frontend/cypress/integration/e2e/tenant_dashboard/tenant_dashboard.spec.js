// Set a global variable to hold the keyword
let keyword = '';

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given('i go to login page', () => {
  cy.device();
});

When(`i type admin's credential`, () => {
  /** simulate input */

  cy.get('.txt-username').type('test_auto_admin_01@thetreedots.com');
  cy.get('.txt-password').type('TanyaAjaOrangBatam2020');

  /** simulate click */
  cy.get('.btn_login').click();

  /** wait for backend response and stuff */
  cy.wait(3000);
});

Then(`it should redirect to Dashboard`, () => {
  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/dashboard');
  });
});

Given('my company data is loaded', () => {
  cy.wait(5000);
});

Then('i can see the data in dashboard', () => {
  cy.get('[data-cy=dashboard-sales]').should('have.length.gte', 1);
  cy.get('[data-cy=dashboard-orders]').should('have.length.gte', 1);
  cy.get('[data-cy=dashboard-customers]').should('have.length.gte', 1);
  cy.get('[data-cy=dashboard-products]').should('have.length.gte', 1);
  cy.get('[data-cy=dashboard-chart]').should('have.length.gte', 1);
});
