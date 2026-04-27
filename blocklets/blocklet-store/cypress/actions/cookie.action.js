/// <reference types="Cypress" />

class CookieAction {
  init() {
    cy.setCookie('nf_lang', 'en');
    cy.setCookie('CookieConsent', 'true');
    cy.clearCookie('connected_did');
    cy.clearCookie('connected_pk');
    cy.clearCookie('login_token');
  }
}

module.exports = {
  cookieAction: new CookieAction(),
};
