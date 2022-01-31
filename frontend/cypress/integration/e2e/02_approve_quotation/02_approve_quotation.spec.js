import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

/** Start Background or Scenario 1 */
Given(`we go to login page on {string}`, (os) => {
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });
  /** view with mobile screen */
  cy.viewport(414, 846);
  cy.device('/login', os);
  cy.wait(2000);
  /** skip intro */
  cy.get('[data-cy=btnSkip]').click();
  cy.wait(2000);
});

/** login with email method */
When(`we click email button`, () => {
  cy.get('[data-cy=btnEmail]').click();
  cy.wait(1000);
});

And(`key in {string} and {string} for email method`, (email, password) => {
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click to Login */
  cy.get('[data-cy=btnLogin]').click();

  /** wait for backend response and stuff */
  cy.wait(3000);
});

And(`app path is {string}`, (path) => {
  cy.wait(3000);

  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq(path);
  });
});

/** Select Customer */

And(`we select company list`, () => {
  const selectCompany = cy.get('.q-table__grid-content > :nth-child(1)');
  if (selectCompany) {
    cy.get('.q-table__grid-content > :nth-child(1)').click();
    cy.wait(2000);
    cy.get('.q-item--dense').click();
    cy.wait(2000);
  } else {
    cy.wait(1000);
  }
});

Then(`we go to home page on {string}`, (home_path) => {
  cy.wait(3000);

  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq(home_path);
  });
});

Given('we go to home page on {string}', (home_path) => {
  cy.viewport(414, 846);
  cy.location().should((location) => {
    expect(location.pathname).to.eq(home_path);
  });

  cy.wait(3000);
});

/** go to Notification page */
When('we click notification icon button and redirect to {string}', (notification_path) => {
  cy.get('[data-cy=btnNotification]').click();
  cy.wait(2000);
  cy.location().should((location) => {
    expect(location.pathname).to.eq(notification_path);
  });
  cy.wait(2000);
});

/** Chose quotation tab */
And('we chose quotation tab menu on {string}', (quotation_path) => {
  cy.get('.q-header > .q-tabs > .q-tabs__content > :nth-child(2)').click();

  cy.location().should((location) => {
    expect(location.pathname).to.eq(quotation_path);
  });
  cy.wait(2000);
});

/** Click item product for request */
And('click Item or Take Action button with {string} and view detail product', (product_name) => {
  cy.get('[data-cy=quotation-products]').contains(product_name).click();

  /** view detail product */
  cy.get('.q-dialog').should('be.visible');
  cy.wait(2000);
});

/** put in product price */
And('put in price $ {string}, for example and click send button to approve', (price) => {
  cy.get('[data-cy=inputPrice]').type(price);
  cy.wait(2000);
  cy.get('[data-cy=btnSend]').click();
});

/** Send Approved and view Alert information*/
Then('we look Approved succes dialog', () => {
  cy.get('.q-dialog').should('be.visible');
  cy.wait(2000);
  cy.get('[data-cy=alert-button').click();
  cy.wait(2000);
});

Given('we go back to quotation page on {string}', (quotation_path) => {
  cy.location().should((location) => {
    expect(location.pathname).to.eq(quotation_path);
  });
  cy.wait(2000);
});

When('click Item or Take Action button with {string} and view detail product', (product_name) => {
  cy.get('[data-cy=quotation-products]').contains(product_name).click();

  cy.get('.q-dialog').should('be.visible');
});

/** Send Approved and view Alert information*/
Then('we look Approved failed dialog', () => {
  cy.get('.q-dialog').should('be.visible');
  cy.wait(2000);
  cy.get('[data-cy=alert-button').click();
  cy.wait(2000);
  cy.get('[data-cy=btnCloseDialogDetail]').click();
  cy.wait(2000);
});
