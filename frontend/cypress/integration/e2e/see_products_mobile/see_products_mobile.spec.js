import { base } from 'src/config';
import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';

Given(`we go to login page on {string}`, (os) => {
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
When(`we click phone button`, () => {
  cy.get('#btnPhone').click();
  cy.wait(2000);
});
And(`key in {string} and {string} for email method`, (email, password) => {
  const host = location.host.split('.')[0];
  if (email === 'test_auto_admin_01@thetreedots.com' && host === 'dashboard')
    password = 'TanyaAjaOrangBatam2020';
  /** simulate input */
  cy.get('.txt-username').type(email);
  cy.get('.txt-password').type(password);

  /** simulate click */
  cy.get('#btnLogin').click();

  /** wait for backend response and stuff */
  cy.wait(2000);
});

And(`key in {string} and {string} for phone method`, (phone, password) => {
  const host = location.host.split('.')[0];
  if (phone === '100010010001' && host === 'dashboard') password = 'TanyaAjaOrangBatam2020';
  cy.get('.vti__dropdown-arrow').click().type('{downarrow}{enter}');
  /** simulate input */
  cy.get('input[type=tel]').type(phone);
  cy.get('input[type=password]').type(password);

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
      // cy.get('body').find('.q-item--dense').its('length').then(res=> {
      //   if(res > 0 ){
      //     cy.get('.q-item--dense').click();
      //     cy.wait(2000);
      //   } else {
      //     cy.wait(2000);
      //   }
      // })
    }
  });
  // cy.get('.q-table__grid-content > :nth-child(1)').its('length').then(res=> {
  //   cy.get('.q-table__grid-content > :nth-child(1)').click();
  //   cy.wait(2000);
  //   cy.get('.q-item--dense').click();
  //   cy.wait(2000);
  // });
  // if (selectCompany) {
  // } else {
  cy.wait(2000);
  // }
});

And(`we go to all product tab on {string}`, (home_path) => {
  cy.wait(2000);
  cy.location().should((location) => {
    expect(location.pathname).to.eq(home_path);
  });
  cy.get('.q-header > .q-tabs > .q-tabs__content > :nth-child(2)').click();
  cy.wait(2000);
});

Then(`make sure list of product is exist with minimum 1 product`, () => {
  cy.get(`#q-app > div > div > div > div > div.q-infinite-scroll`).should('exist');
  cy.get(`#q-app > div > div > div > div > div.q-infinite-scroll`).children().should('have.length.gte', 1);
});
