import { base } from 'src/config';
import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given(`we go to login on {string}`, (os) => {
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });
  cy.device('/login', os);
  cy.wait(2000);
  /** skip intro */
  if (cy.get('#btnSkip')) {
    cy.get('#btnSkip').click();
  }
  cy.wait(2000);
});
When(`we click email button`, () => {
  cy.get('#btnEmail').click();
  cy.wait(2000);
});
And(`key in {string} and {string} for email method`, (email, password) => {
  const host = location.host.split('.')[0];
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('#btnLogin').click();

  /** wait for backend response and stuff */
  cy.wait(2000);
});

And(`app path is {string}`, (path) => {
  cy.wait(2000);
  /** check the path */
  cy.location().should((location) => {
    expect(location.pathname).to.eq(path);
  });
});

And(`we select company list`, () => {
  cy.wait(2000);
  cy.get('body').then(($body) => {
    if ($body.find('.q-table__grid-content > :nth-child(1)').length > 0) {
      cy.get('.q-table__grid-content > :nth-child(1)').click();
      cy.wait(2000);
      cy.get('body').then(($body2) => {
        if ($body2.find('.q-item--dense').length > 0) {
          //evaluates as true
          cy.get('.q-item--dense').click();
          cy.wait(2000);
        }
      });
    }
  });
  cy.wait(2000);
});

And(`we go to orders page`, () => {
  cy.wait(2000);
  cy.get('[data-cy=Orders]').click();
  cy.wait(2000);
});

And(`then it should show list of orders`, () => {
  cy.wait(5000);
  cy.get(`#q-app > div > div > main > div > div > div.column > div.q-infinite-scroll`).should('exist');
  cy.get(`#q-app > div > div > main > div > div > div.column > div.q-infinite-scroll`)
    .children()
    .should('have.length.gte', 1);
});

And(`we can click one of the order in the list`, () => {
  cy.get(`#q-app > div > div > main > div > div > div.column > div.q-infinite-scroll`)
    .children()
    .first()
    .click();
  cy.wait(1000);
});
And(`we can click detail button to show details`, () => {
  cy.get(':nth-child(3) > .q-mr-sm > .q-btn__wrapper').click();
});

Then(`order item details show up`, () => {
  cy.wait(1000);
  cy.get('[data-cy=OrderItemDetails]').should('exist');
});
