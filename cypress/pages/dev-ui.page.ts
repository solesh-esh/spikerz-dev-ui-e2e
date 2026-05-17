import { readDevUiCredentials } from '../support/config/credentials.js';
import { BasePage } from './base.page.js';

export class DevUiPage extends BasePage {
  visit(path = '/'): void {
    readDevUiCredentials().then((devUi) => {
      cy.visit(path, {
        auth: {
          username: devUi.username,
          password: devUi.password,
        },
      });
    });
  }

  assertOnDemoSite(): void {
    this.assertHostname('demo.spikerz.com');
  }
}

export const devUiPage = new DevUiPage();
