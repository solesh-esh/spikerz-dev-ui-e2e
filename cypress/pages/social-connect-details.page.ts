import { BasePage } from './base.page.js';

const selectors = {
  confirmDetailsHeading:
    '#main-container > div > div > div > social-connect-onboarding > div > div > div > app-social-connect-details > nz-card > div > div > h5',
} as const;

const confirmDetailsText = 'Confirm details';

export class SocialConnectDetailsPage extends BasePage {
  assertConfirmDetailsVisible(): void {
    cy.get(selectors.confirmDetailsHeading, { timeout: 120_000 })
      .first()
      .should('be.visible')
      .and('contain.text', confirmDetailsText);
  }
}

export const socialConnectDetailsPage = new SocialConnectDetailsPage();
