/// <reference types="Cypress" />

const { fromJSON } = require('@ocap/wallet');

Cypress.Commands.add('getOwnerWallet', () =>
  cy.readFile('.cypress/owner.json', { log: true }).then((json) => fromJSON(json))
);
Cypress.Commands.add('getOwnerProfile', () => ({ email: 'shijun@arcblock.io', fullName: 'wangshijun' }));

Cypress.Commands.add('getStoreWallet', () => cy.readFile('.cypress/store.json').then((json) => fromJSON(json)));
