import { base } from 'src/config';

// Set a global variable to hold the keyword
let keyword = '';

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given('i go to login page', () => {
  cy.device();
});

When(`i type admin's credential`, () => {
  /** simulate input */

  let password = 'TanyaAjaOrangBatam2020';

  cy.get('.txt-username').type('test_auto_admin_01@thetreedots.com');
  cy.get('.txt-password').type(password);

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

Given('i go to finance invoices page', () => {
  // go to invoices page
  cy.visit(base + '/main/b2b/invoices');
});

When('i click searchbar', () => {
  cy.get('[data-cy=search-bar]').click();
});

And("type invoice's name", () => {
  cy.wait(3000);
  //go check if the table of invoices is exist
  cy.get('.tdots-table').should('exist');
  //go check the first row data in table to get the invoice customer name and store as variable: text
  cy.get('.tdots-table')
    .find('tr')
    .eq(1)
    .find('td')
    .eq(4)
    .invoke('text')
    .then((text) => {
      //assign the value of variable: text to global variable: keyword
      keyword = text;
      //type or fill the search bar with the value of variable: text
      cy.get('[data-cy=search-bar]').type(text);
    });
});

And("type invoice's number", () => {
  cy.wait(3000);
  //go check if the table of invoices is exist
  cy.get('.tdots-table').should('exist');
  //go check the first row data in table to get the invoice number and store as variable: text
  cy.get('.tdots-table')
    .find('tr')
    .eq(1)
    .find('td')
    .eq(0)
    .invoke('text')
    .then((text) => {
      //assign the value of variable: text to global variable: keyword
      keyword = text;
      //type or fill the search bar with the value of variable: text
      cy.get('[data-cy=search-bar]').type(text);
    });
});

Then('it should display invoice with that data', () => {
  cy.wait(2000);
  //confirm if the result in the table contains the value of global variable: keyword
  cy.get('.tdots-table').contains('td', keyword);
});
