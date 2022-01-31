import { base } from 'src/config';

Cypress.Commands.add('device', (path = '/login', device = null) => {
  if (device === 'android') cy.viewport('samsung-s10');
  else if (device === 'ios') cy.viewport('iphone-6');

  cy.visit(`${base}${path}`, {
    onBeforeLoad: (win) => {
      let useragent = null;
      switch (device) {
        case 'ios':
          useragent =
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
          break;
        case 'android':
          useragent =
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
          break;
        default:
          useragent =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4243.0 Safari/537.36';
          break;
      }
      Object.defineProperty(win.navigator, 'userAgent', {
        value: useragent
      });
    }
  });
});
