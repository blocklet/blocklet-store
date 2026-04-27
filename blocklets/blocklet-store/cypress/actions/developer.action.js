/// <reference types="Cypress" />
const { cookieAction } = require('./cookie.action');

const command = 'blocklet';

class DeveloperAction {
  login() {
    cookieAction.init();
    cy.visit('/');
    cy.login('developer');
  }

  registerAsDeveloper() {
    cy.openAdmin('/developer/registration');
    cy.get('[data-cy="apply-developer"]').click({ force: true });
    cy.get('[data-cy="apply-reason"]').type('I am the owner');
    cy.contains('Confirm').click();
    cy.contains('Waiting for approval');
    return this;
  }

  /**
   *
   * @description 连接store, 即执行 `blocklet connect <stroe-url>`
   * @memberof DeveloperAction
   */
  connectStore() {
    cy.exec(`${command} config ls`).then((execResult) => {
      cy.log('connectStore', execResult);
      cy.location().then((location) => {
        if (!execResult.stdout?.includes(location.hostname)) {
          cy.openAdmin('/developer/access-tokens');
          cy.get('[data-cy="access-token-create"]').click({ force: true });
          cy.get('[data-cy="access-token-remark"]').type('e2e test token');
          cy.get('[data-cy="access-token-submit"]').click({ force: true });
          cy.contains('Create Success');
          cy.get('[data-cy="access-token-reveal"]').click({ force: true });
          cy.get('[data-cy="access-token-saved"]').click({ force: true });
          cy.log('should create access token');

          cy.get('[data-cy="access-token-secret"]')
            .invoke('text')
            .then((secret) => {
              cy.exec(`${command} config set accessToken ${secret.replace('shellcopy', '')} --profile e2e`);
              cy.window().then((win) => {
                cy.exec(`${command} config set store ${win.blocklet.appUrl} --profile e2e`);
                cy.getCookie('connected_did').then((result) => {
                  cy.exec(`${command} config set developerDid ${result.value} --profile e2e`);
                  cy.get('[data-cy="confirm"]').click({ force: true });
                  cy.contains('e2e test token');
                  cy.log('should config access token');
                });
              });
            });
        }
      });
    });

    return this;
  }

  uploadBlocklet({ blockletName, blockletVersion }) {
    cy.openAdmin('/developer/blocklets');

    cy.request('/api/developer/blocklets').then((res) => {
      const existBlocklet = res.body.dataList.some(
        (data) => data.meta.title === blockletName && data.latestVersion.version >= blockletVersion
      );

      cy.log(`${blockletName} exist: ${existBlocklet}`);

      // 如果已经上传过了,就不要上传了
      if (!existBlocklet) {
        cy.exec(
          `${command} upload ./cypress/fixtures/blocklets/${blockletName}/${blockletVersion}/blocklet.json --profile e2e`,
          {}
        );
      }
    });

    return this;
  }

  /**
   *
   *
   * @return {*}
   * @memberof DeveloperAction
   */
  enableAutoPublish({ blockletName }) {
    // 访问开发者界面
    cy.openAdmin('/developer/blocklets');

    // 这个blocklet你得存在吧?
    cy.contains(blockletName).should('exist');

    // 开启blocklet自动发布功能
    // 点击操作列
    cy.get(`tr:contains(${blockletName}) [data-cy="row-actions"]`).click();
    // 判断启用状态
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="autoPublish-disable"]').length > 0) {
        // 如果没有开启自动发布功能，就开启
        cy.get('[data-cy="autoPublish-disable"]').click();
        // 开启扫码阶段
        cy.enableAutoPublishBlocklet();
      } else {
        cy.log('enableAutoPublish', 'blocklet already enabled auto-publish function');
      }
    });

    return this;
  }

  publishBlocklet(blockletName) {
    cy.openAdmin('/developer/blocklets');
    cy.wait(500);
    cy.get('[data-testid="RefreshIcon"]').click({ force: true });
    cy.contains(blockletName);
    cy.get(`:contains(${blockletName}) [data-cy="publish"]`).click({ force: true });
    cy.publishBlocklet();
    cy.log('should publish free blocklet');
    return this;
  }

  viewBlockletDetail({ blockletName, blockletVersion }) {
    cy.visit('/');
    cy.contains(blockletName).should('exist');
    cy.get(`[data-cy="blocklet-item"]:contains(${blockletName})`).click({ force: true });
    cy.contains(blockletName).should('exist');
    cy.contains(blockletVersion).should('exist');
  }

  purchaseBlocklet({ blockletName, blockletVersion }) {
    this.viewBlockletDetail(blockletName, blockletVersion);

    cy.get('[data-cy="launch-blocklet"]').click({ force: true });
    cy.contains('Purchase Blocklet');
    cy.wait(200);
    cy.clearCookie('connected_wallet_os');
    cy.get('[data-cy="purchase-purchase"]').click({ force: true });
    cy.get('[data-cy="purchase-next"]').click({ force: true });
    cy.wait(200);
    cy.contains(`Purchase ${blockletName}`);
  }
}

module.exports = {
  developerAction: new DeveloperAction(),
  DeveloperAction,
};
