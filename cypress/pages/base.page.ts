export abstract class BasePage {
  protected assertHostname(hostname: string, timeout = 120_000): void {
    cy.location('hostname', { timeout }).should('eq', hostname);
  }
}
