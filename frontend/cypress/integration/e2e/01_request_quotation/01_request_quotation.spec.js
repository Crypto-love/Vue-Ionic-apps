import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

/** Start Background or Scenario 1 */
Given(`we go to login page`, () => {
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });

  /** view with mobile screen */
  cy.viewport(414, 846);
  cy.device('/login', 'android');
  cy.wait(2000);
  /** skip intro */
  cy.get('#btnSkip').click();
  cy.wait(1000);
});
When(`we click email button`, () => {
  cy.get('[data-cy=btnEmail]').click();
  cy.wait(1000);
});
And(`key in {string} and {string} for email method`, (email, password) => {
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('[data-cy=btnLogin]').click();

  /** wait for backend response and stuff */
  cy.wait(3000);
});

And(`we redirect to home page`, () => {
  cy.wait(3000);

  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/home');
  });
});

Then(`we chose all tab menu`, () => {
  cy.wait(3000);
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/home');
  });
  cy.get('.q-header > .q-tabs > .q-tabs__content > :nth-child(2)').click();
  cy.wait(2000);

  /** make sure list of product is exist with minimum 1 product */
  cy.get(`#q-app > div > div > div > div > div.q-infinite-scroll`).should('exist');
  cy.get(`#q-app > div > div > div > div > div.q-infinite-scroll`).children().should('have.length.gte', 1);
});

/** End Background or Scenario 1 */

/** Start Scenario 2 >> Send request Quotation success */
Given('we go to home page', () => {
  cy.wait(3000);
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/home');
  });
  cy.get('.q-header > .q-tabs > .q-tabs__content > :nth-child(2)').click();
  cy.wait(2000);
});

When(
  'we chose Item Produk with name is {string}. Once found, it will show product detail',
  (product_name) => {
    cy.get('[data-cy=search]').type(product_name);

    cy.wait(2000);

    cy.get('[data-cy=products]').contains(product_name).click();

    cy.get('.q-dialog').should('be.visible');
    cy.wait(2000);
  }
);

And('we click Request Quotation button', () => {
  cy.get('[data-cy=btnRequest').click();
  cy.wait(2000);
});

Then('we look Request succes dialog', () => {
  cy.get('.q-dialog').should('be.visible');
  cy.wait(2000);
  cy.get('[data-cy=alert-button]').click();
  cy.wait(1000);
  cy.get('[data-cy=btnCloseDetailDialog]').click();
});

/** End Scenario 2 >> Send request Quotation success */

/** Start Scenario 3 >> Check All of Quotation status */
Given('we go to b2b home page and click notofication icon button', () => {
  cy.wait(2000);
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/home');
  });
  cy.get('[data-cy=btnNotification]').click();
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/notification/transactions');
  });
});

When('we tap Quoatation tab menu', () => {
  cy.get('.q-header > .q-tabs > .q-tabs__content > :nth-child(2)').click();
  cy.wait(2000);
});

And('we can look all of quotation request status', () => {
  cy.location().should((location) => {
    expect(location.pathname).to.eq('/main/buyer_b2b/notification/quotations');
  });
});

Then('we can tap product item to view detail product', () => {
  cy.get('[data-cy=quotation-products]').contains('Beef Cube').click();

  cy.get('.q-dialog').should('be.visible');
});

/** End Scenario 3 >> Check All of Quotation status */
