/// <reference types="Cypress" />

const { cookieAction } = require('./cookie.action');
const { DeveloperAction } = require('./developer.action');

class AdminAction extends DeveloperAction {
  loginAsOwner() {
    cookieAction.init();
    cy.visit('/');
    cy.login();
  }

  loginAsDeveloper() {
    super.login();
  }

  registerAsDeveloper() {
    // 注册开发者
    super.registerAsDeveloper();
    // 通过注册
    cy.openAdmin('/console/apply');
    cy.contains('wangshijun');
    cy.get('[data-cy="approve-trigger"]').first().click({ force: true });
    cy.get('[data-cy="confirm"]').click({ force: true });
    cy.get('[data-cy="confirm"]').should('not.exist');

    cy.openAdmin('/console/developers');
    cy.reload();
    // @see: https://stackoverflow.com/a/57705793
    cy.waitUntil(
      () =>
        cy
          .get('[data-testid="RefreshIcon"]')
          .should('exist')
          .click()
          .then(() => Cypress.$(':contains(wangshijun)').length > 0),
      {
        interval: 500,
      }
    );
    return this;
  }
}

module.exports = {
  adminAction: new AdminAction(),
};
