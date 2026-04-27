/// <reference types="Cypress" />

const { adminAction } = require('../actions/admin.action');
const { developerAction } = require('../actions/developer.action');

describe('developer-publish-blocklet-workflow.spec', () => {
  before(() => {
    cy.visit('/');
    adminAction.loginAsDeveloper();
  });

  it('The free blocklet should be published successfully', () => {
    const blockletName = 'static-demo';
    const blockletVersion = '1.1.21';

    adminAction.uploadBlocklet({ blockletName, blockletVersion });
    adminAction.publishBlocklet(blockletName);
    adminAction.viewBlockletDetail({ blockletName, blockletVersion });
  });

  it('The blocklet should be published automatically', () => {
    const blockletName = 'static-demo';
    const blockletVersion = '1.1.22';
    developerAction.enableAutoPublish({ blockletName });
    developerAction.uploadBlocklet({
      blockletName,
      blockletVersion,
    });
    developerAction.viewBlockletDetail({ blockletName, blockletVersion });
  });

  it('The paid blocklet should be published successfully', () => {
    const blockletName = 'payment-demo';
    const blockletVersion = '1.5.6';

    adminAction.uploadBlocklet({ blockletName, blockletVersion });
    adminAction.publishBlocklet(blockletName);
    adminAction.viewBlockletDetail({ blockletName, blockletVersion });
  });

  it('should buy paid blocklet successfully', () => {
    const blockletName = 'payment-demo';
    const blockletVersion = '1.5.6';
    adminAction.viewBlockletDetail({ blockletName, blockletVersion });
  });

  // FIXME: 还有一个升级付费应用的版本的流程
});
