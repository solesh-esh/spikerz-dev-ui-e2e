import {
  chooseAccountsPage,
  devUiPage,
  socialConnectDetailsPage,
  socialConnectPage,
} from '../pages/index.js';

describe('Spikerz YouTube social connection', () => {
  it('connects a YouTube account and confirms details', () => {
    devUiPage.visit('/');
    devUiPage.assertOnDemoSite();

    devUiPage.visit('/social-connect/');
    socialConnectPage.selectYoutube();
    socialConnectPage.clickYoutubeConnect();
    socialConnectPage.waitForYoutubeCallback();

    chooseAccountsPage.assertPopupVisible();
    chooseAccountsPage.confirmAccountSelection();

    socialConnectDetailsPage.assertConfirmDetailsVisible();
  });
});
