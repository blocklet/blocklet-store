/// <reference types="Cypress" />

const PAGE = {
  EXPLORER: '/',
  SEARCH: '/search?category=All',
};
class UserAction {
  /**
   *
   * @param {{
   *  category: string
   *  blockletNames: string[]
   * }} { category, blockletNames }
   * @memberof UserAction
   */
  searchByCategory({ category, blockletNames }) {
    cy.visit(PAGE.EXPLORER);
    cy.get(`[data-cy="filter"]:contains(${category})`).should('be.visible').click();
    cy.url().should('include', 'category');

    blockletNames.forEach((blockletName) => cy.contains(blockletName).should('be.visible'));
  }

  /**
   *
   *
   * @param {{
   *  blockletNames: string[] = []
   * }} {blockletNames}
   * @memberof UserAction
   */
  searchByFree({ blockletNames = [] }) {
    cy.visit(PAGE.SEARCH);

    cy.contains('Free').should('be.visible').click();
    cy.url().should('include', 'price=free');

    blockletNames.forEach((blockletName) => cy.contains(blockletName).should('be.visible'));
  }

  /**
   *
   *
   * @param {{
   *  orderBy: string,
   *  blockletNames: string[]
   * }} {order, blockletNames}
   * @memberof UserAction
   */
  searchBySort({ orderBy, blockletNames }) {
    cy.visit(PAGE.SEARCH);
    cy.contains('Most Popular').should('be.visible').click();
    cy.contains(orderBy).should('be.visible').click({ force: true });
    cy.get('body').click();

    cy.url().should('include', 'sortBy');

    blockletNames.forEach((blockletName) => cy.contains(blockletName).should('be.visible'));
  }

  /**
   *
   * @description
   * @see https://store.blocklet.dev/search?search=did
   * @param {{
   *  keyword: string,
   *  blockletNames: string[],
   * }} { keyword, blockletNames}
   * @memberof UserAction
   */
  searchByKeyword({ keyword, blockletNames }) {
    cy.visit(PAGE.SEARCH);
    cy.waitUntil(() =>
      cy
        .get('.bl-autocomplete-input')
        .clear({ force: true })
        .type(keyword)
        .type('{enter}')
        .then(($el) => $el.val())
    );
    cy.url().should('include', keyword);

    for (const blockletName of blockletNames) {
      cy.contains(blockletName).should('be.visible');
    }
  }

  /**
   *
   * @description
   * @see https://store.blocklet.dev
   * @param {{
   *  keyword: string,
   *  blockletNames: string[],
   * }} { keyword, blockletNames}
   * @memberof UserAction
   */
  searchByAutoComplete({ keyword, blockletName }) {
    cy.visit(PAGE.SEARCH);
    cy.waitUntil(() =>
      cy
        .get('.bl-autocomplete-input')
        .clear({ force: true })
        .type(keyword)
        .then(($el) => $el.val())
    );

    cy.get(`[data-cy="bl-autocomplete-item"]:contains(${blockletName})`).click();
    // 点击detail这个按钮
    cy.contains('Detail').should('be.visible').click();
    // blocklet的名称应该显示
    cy.contains(blockletName).should('be.visible').should('exist');
  }

  /**
   *
   * @see https://store.blocklet.dev/blocklets/z8ia1Qx3edFD1ju6U7usk6wR8QBWoc6VUkmRQ
   * @description 查看blocklet详情
   * @param {{
   *  blockletName: string,
   *  blockletDescription: string,
   *  blockletAuthor: string,
   * }} blockletName
   * @memberof UserAction
   */
  viewBlockletDetail({ blockletName, blockletDescription, blockletAuthor }) {
    cy.visit(PAGE.SEARCH);
    cy.contains(blockletName).should('exist');
    cy.get(`[data-cy="blocklet-item"]:contains(${blockletName})`).click();

    // 点击detail这个按钮
    cy.contains('Detail').should('be.visible').click();

    // blocklet的名称应该显示
    cy.contains(blockletName).should('be.visible').should('exist');
    // blocklet的描述应该显示
    cy.contains(blockletDescription).should('be.visible').should('exist');
    // 免费的blocklet右上角就会显示Launch, 不是免费的时候就会显示价格
    cy.contains(blockletAuthor).should('be.visible').should('exist');

    // Package size
    cy.get('[data-cy="detail-blocklet-size"]').should('be.visible').should('not.be.empty');
    // version
    cy.get('[data-cy="detail-blocklet-version"]').should('be.visible').should('not.be.empty');
    // category
    cy.get('[data-cy="detail-blocklet-category"]').should('be.visible').should('not.be.empty');

    // Download
    cy.get('[data-cy="blocklet-download-count"]').should('be.visible').invoke('text').should('match', /^\d+$/);

    // Published At
    cy.get('[data-cy="blocklet-last-published-at"]').should('be.visible').should('not.be.empty');
    // Requirements
    cy.get('[data-cy="blocklet-requirements"]').should('be.visible').should('not.be.empty');
  }

  /**
   * @description blocklet 详情页的分类tag点击之后应该按分类筛选 返回首页
   * @param {{
   *  blockletName: string,
   *  category: string,
   * }} { blockletName, category }
   * @memberof UserAction
   */
  searchByDetailPageCategory({ blockletName }) {
    cy.visit(PAGE.SEARCH);
    cy.contains(blockletName).should('exist');
    cy.get(`[data-cy="blocklet-item"]:contains(${blockletName})`).click();
    // 点击详情页头部的类别
    cy.get(`[data-cy="blocklet-category-blocklet"]:contains(${blockletName})`).click({ force: true });
    // 应该找到想要查找的 blocklet
    cy.url().should('include', category);
  }

  /**
   *@description blocklet 详情页的作者 tag 点击之后应该按 作者 筛选 返回首页
   * @param {{
   *  blockletName: string,
   *  blockletAuthor: string,
   * }} { blockletName, blockletAuthor }
   * @memberof UserAction
   */
  searchByDetailPageDeveloper({ blockletName, blockletAuthor }) {
    cy.visit(PAGE.SEARCH);
    cy.contains(blockletName).should('exist');
    cy.get(`[data-cy="blocklet-item"]:contains(${blockletName})`).click();
    // 点击详情页更多作者 的 View All button
    cy.get('[data-cy="blocklet-author-blocklet"]:contains("View All")').click({ force: true });
    // 页面上应该有作者的 Tag
    cy.get(`[data-cy="filter-tag"]:contains(${blockletAuthor})`).should('be.visible');
    // 应该找到想要查找的 blocklet
    cy.url().should('include', 'owner');
  }
}

module.exports = UserAction;
