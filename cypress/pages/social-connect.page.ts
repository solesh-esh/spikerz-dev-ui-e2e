import { readDevUiCredentials } from '../support/config/credentials.js';
import { YOUTUBE_OAUTH_CALLBACK_URL } from '../support/constants/youtube-oauth.js';
import { BasePage } from './base.page.js';

const selectors = {
  youtubePlatform:
    '#main-container > div > div > div > social-connect-onboarding > div > div > div > div.select-platform.margin-bottom-scroll.ng-tns-c22985110-1 > nz-card:nth-child(4) > div > div > img',
  youtubeConnectButton:
    '#main-container > div > div > div > social-connect-onboarding > div > div > div > app-social-connect > nz-card > div > div > div.buttons-container > div > div.button-title-wrapper.ng-star-inserted > app-google-and-youtube-login > div > div > app-button > button',
} as const;

export class SocialConnectPage extends BasePage {
  selectYoutube(): void {
    cy.get(selectors.youtubePlatform, { timeout: 60_000 }).should('be.visible').click({ force: true });
  }

  clickYoutubeConnect(): void {
    cy.get(selectors.youtubeConnectButton, { timeout: 60_000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    readDevUiCredentials().then((devUi) => {
      cy.visit(YOUTUBE_OAUTH_CALLBACK_URL, {
        auth: {
          username: devUi.username,
          password: devUi.password,
        },
      });
    });
  }

  waitForYoutubeCallback(): void {
    cy.location('pathname', { timeout: 120_000 }).should('include', '/social-connect/youtube');
  }
}

export const socialConnectPage = new SocialConnectPage();
