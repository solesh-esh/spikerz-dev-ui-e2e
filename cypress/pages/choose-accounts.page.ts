import { BasePage } from './base.page.js';

const selectors = {
  popupTitle: 'Choose accounts to connect',
  modal: 'nz-modal-container',
  accountLabel: 'label.ant-checkbox-wrapper.account-details-label',
  chooseButton:
    'div.ant-modal-footer > div > app-button:nth-child(2) > button > span.button-text.text-m-bold',
} as const;

export class ChooseAccountsPage extends BasePage {
  private getVisibleModal(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .contains(selectors.modal, selectors.popupTitle, { timeout: 120_000 })
      .should('be.visible')
      .closest(selectors.modal);
  }

  assertPopupVisible(): void {
    this.getVisibleModal().should('be.visible');
  }

  selectAccount(): void {
    this.getVisibleModal().find(selectors.accountLabel).first().should('be.visible').click({ force: true });
  }

  clickChoose(): void {
    this.getVisibleModal()
      .find(selectors.chooseButton)
      .should('be.visible')
      .click({ force: true });
  }

  confirmAccountSelection(): void {
    this.assertPopupVisible();
    this.selectAccount();
    this.clickChoose();
  }
}

export const chooseAccountsPage = new ChooseAccountsPage();
