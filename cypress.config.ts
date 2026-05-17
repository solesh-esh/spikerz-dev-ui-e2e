import { defineConfig } from 'cypress';

const DEFAULT_BASE_URL = 'https://demo.spikerz.com';
const DEFAULT_DEV_USERNAME = 'me';
const DEFAULT_DEV_PASSWORD = 'SmipMe123456';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? DEFAULT_BASE_URL,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    defaultCommandTimeout: 15_000,
    pageLoadTimeout: 120_000,
    requestTimeout: 30_000,
    responseTimeout: 30_000,
    video: true,
    screenshotOnRunFailure: true,
    allowCypressEnv: false,
    env: {
      DEV_UI_USERNAME: process.env.CYPRESS_DEV_UI_USERNAME ?? DEFAULT_DEV_USERNAME,
      DEV_UI_PASSWORD: process.env.CYPRESS_DEV_UI_PASSWORD ?? DEFAULT_DEV_PASSWORD,
    },
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure');
        }

        return launchOptions;
      });
    },
  },
});
