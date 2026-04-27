/// <reference types="Cypress" />

const { adminAction } = require('../actions/admin.action');

describe('initialize-workflow.spec', () => {
  it('should be logged in as the owner of the store', () => {
    adminAction.loginAsOwner();
  });

  it('should be able to register as a developer successfully', () => {
    adminAction.registerAsDeveloper();
  });

  it('should connect to store via CLI', () => {
    adminAction.loginAsDeveloper();
    adminAction.connectStore();
  });
});
