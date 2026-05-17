Cypress.on('uncaught:exception', () => {
  // Third-party OAuth pages can throw non-test script errors that should not fail this flow.
  return false;
});
