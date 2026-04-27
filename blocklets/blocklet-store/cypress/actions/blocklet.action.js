/// <reference types="Cypress" />

class BlockletAction {
  /**
   *
   * @description 禁用blocklet
   * @param {*} blocklet
   * @memberof BlockletAction
   */
  disable(blockletName) {
    cy.openAdmin('/console/blocklets');

    // 点击操作列
    cy.get(`tr:contains(${blockletName}) [data-cy="row-actions"]`).click();
    // 判断是否存在禁用选项
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="blocklet-disable"]').length > 0) {
        // 如果存在禁用选项就点击禁用
        cy.get('[data-cy="blocklet-disable"]').click();
        // 输入禁用原因
        cy.get('[data-cy="disable-blocklet-reason"]').type('e2e test disable blocklet');
        // 确认禁用
        cy.get('[data-cy="disable-blocklet-submit"]').click();
      }
    });

    return this;
  }

  /**
   *
   * @description 启用blocklet
   * @param {*} blockletName
   * @memberof BlockletAction
   */
  enable(blockletName) {
    cy.openAdmin('/console/blocklets');

    cy.contains(blockletName).should('exist');
    // 点击操作列
    cy.get(`tr:contains(${blockletName}) [data-cy="row-actions"]`).click();
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="blocklet-enable"]').length > 0) {
        // 如果存在禁用选项就点击禁用
        cy.get('[data-cy="blocklet-enable"]').click();
        cy.get('[data-cy="confirm"]').click();
      }
    });
  }

  updateCategory({ blockletName, category }) {
    this.enable(blockletName);

    cy.openAdmin('/console/blocklets');
    // 点击操作列
    cy.get(`tr:contains(${blockletName}) [data-cy="row-actions"]`).click();
    // 点击编辑按钮
    cy.get('[data-cy="blocklet-edit"]').click();
    // 点击弹出下拉框 @see: https://stackoverflow.com/a/64681471
    cy.get('[data-cy="category-dialog"]').should('exist').click();
    cy.wait(500);
    cy.get('[data-cy="select-category"]').should('exist').click();

    // 选择某个category
    cy.get(`[data-cy="category-option"]:contains(${category})`).click();

    // 确认更新
    cy.get('[data-cy="confirm"]').click();

    // 确认按钮应该不存在
    cy.get('[data-cy="confirm"]').should('not.exist');

    // 此时category应该更新好了吧?
    cy.contains(category).should('exist');

    return this;
  }
}

module.exports = new BlockletAction();
