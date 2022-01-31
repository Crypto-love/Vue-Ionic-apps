import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given(`we go to login`, () => {
  cy.device();
  //skip update
  cy.wait(500);
  cy.get('[data-cy=alert-button] > .q-btn__wrapper > .q-btn__content').then(($button) => {
    if ($button.is(':visible')) {
      cy.get('[data-cy=alert-button] > .q-btn__wrapper > .q-btn__content').click();
    }
  });
});

When(`key in {string} and {string}`, (email, password) => {
  cy.wait(1000);
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('.btn_login').click();

  /** wait for backend response and stuff */
  cy.wait(2000);
});

And(`key in {string} and {string}`, (email, password) => {
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('.btn_login').click();

  /** wait for backend response and stuff */
  cy.wait(2000);
});

Then(`app path is {string}`, (path) => {
  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq(path);
  });

  /** the approaches are many
   * 1. check location/path
   * 2. check spesific element exist or value
   * 3. and so on
   */
});
