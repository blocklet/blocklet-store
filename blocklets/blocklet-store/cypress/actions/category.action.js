/// <reference types="Cypress" />

class CategoryAction {
  createDefaultCategorys() {
    cy.openAdmin('/console/categories');
    cy.request('/api/console/categories').then((res) => {
      if (res.body.dataList.length === 0) {
        cy.get('[data-cy="category-create-default"]').click({ force: true });
        cy.get('[data-cy="confirm"]').click({ force: true });
        cy.get('[data-testid="RefreshIcon"]').click({ force: true });
      }
      cy.get('[data-cy="row-actions"]').should('exist');
    });

    return this;
  }

  /**
   *
   * @description 添加种类
   * @param {*} { englishName, chineseName }
   * @return {*}
   * @memberof CategoryAction
   */
  add({ englishName, chineseName }) {
    cy.openAdmin('/console/categories');

    // 点击创建按钮
    cy.get('[data-cy="category-create"]').click();

    // 输入category
    cy.get('[data-cy="category-English-name"]').type(englishName);
    cy.get('[data-cy="category-Chinese-name"]').type(chineseName);

    // 点击确认
    cy.get('[data-cy="confirm"]').click();

    // 弹窗关闭了的话,刚才的输入框应该不见了
    cy.get('[data-cy="category-English-name"]').should('not.exist');

    // 此时,界面上应该存在新记录
    cy.contains(englishName).should('exist');
    cy.contains(chineseName).should('exist');

    return this;
  }

  /**
   *
   * @description 删除某个种类
   * @param {*} englishName
   * @return {*}
   * @memberof CategoryAction
   */
  deleteByEnglishName(englishName) {
    cy.openAdmin('/console/categories');

    // 确保界面上已经有记录了,不然没法删除记录
    cy.contains(englishName).should('exist');

    // 点击 操作列的按钮
    // https://docs.cypress.io/api/commands/contains#Selector
    cy.get(`tr:contains(${englishName}) [data-cy="row-actions"]`).click();
    // 点击删除
    cy.get('[data-cy="category-delete"]').click();
    // 确认删除
    cy.get('[data-cy="confirm"]').click({ force: true });

    // 这会被删除了,应该找不到这个category了吧?
    cy.contains(englishName).should('not.exist');

    return this;
  }

  update(englishName, { newEnglishName, newChineseName }) {
    cy.openAdmin('/console/categories');

    cy.contains(englishName).should('exist');
    // 点击 操作列的按钮
    cy.get(`tr:contains(${englishName}) [data-cy="row-actions"]`).click();
    // 点击编辑按钮
    cy.get('[data-cy="category-edit"]').click();

    // 输入新的category
    cy.get('[data-cy="category-English-name"]').clear().type(newEnglishName);
    cy.get('[data-cy="category-Chinese-name"]').clear().type(newChineseName);

    // 点击确认编辑
    cy.get('[data-cy="confirm"]').click();

    // 弹窗关闭了的话,刚才的输入框应该不见了
    cy.get('[data-cy="category-English-name"]').should('not.exist');

    // 此时,界面上应该存在新记录
    cy.contains(newEnglishName).should('exist');
    cy.contains(newChineseName).should('exist');

    return this;
  }
}

module.exports = new CategoryAction();
