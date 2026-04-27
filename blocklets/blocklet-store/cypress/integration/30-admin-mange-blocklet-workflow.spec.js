/// <reference types="Cypress" />

const { adminAction } = require('../actions/admin.action');
const BlockletAction = require('../actions/blocklet.action');

describe('admin-mange-blocklet-workflow.spec', () => {
  before(() => {
    cy.visit('/');
    adminAction.loginAsOwner();
  });

  it('A blocklet should be disabled', () => {
    const blockletName = 'static-demo';
    BlockletAction.disable(blockletName).enable(blockletName);
  });

  it("A blocklet's category has been updated", () => {
    const blockletName = 'static-demo';
    BlockletAction.updateCategory({ blockletName, category: 'Blog' });
  });
});
