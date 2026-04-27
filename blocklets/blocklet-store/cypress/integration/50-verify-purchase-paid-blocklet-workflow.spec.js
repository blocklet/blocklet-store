/// <reference types="Cypress" />

describe('verify-purchase-paid-blocklet-workflow.spec.js', () => {
  before(() => {
    cy.visit('/');
  });

  it('should be pass verify-purchase-blocklet action', () => {
    cy.verifyPurchaseBlocklet({
      tokenUrl: `${
        Cypress.config().baseUrl
      }/api/did/verify-purchase-blocklet/token?serverDid=zNKuTPZQyk5VY7j8Mm8iz1tszouaX7LwLjMe&blockletDid=z8iZyFxvvqwW98MiqKv1tmws2o3iTZnTajE3B&blockletMetaUrl=https%3A%2F%2Fyour-store.example.com%2Fapi%2Fblocklets%2Fz8iZyFxvvqwW98MiqKv1tmws2o3iTZnTajE3B%2Fblocklet.json&_ek_=example-key&locale=zh&autoConnect=true`,
    });
  });
});
