import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import { base } from 'src/config';
Given(`we go to login`, () => {
  cy.device();
});
When(`key in {string} and {string}`, (email, password) => {
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
  cy.visit(base + '/main/b2b/orders');
  cy.wait(2000);
  cy.get(
    ':nth-child(1) > [style="width: 32px;"] > .column > :nth-child(3) > .q-btn__wrapper > .q-btn__content'
  ).click();
  cy.get('.btn-cancel > .q-btn__wrapper').click();
  cy.get('.q-field__append > .cursor-pointer').click({ multiple: true });

  /** the approaches are many
   * 1. check location/path
   * 2. check spesific element exist or value
   * 3. and so on
   */
});
