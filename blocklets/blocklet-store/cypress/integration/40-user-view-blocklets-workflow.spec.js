/// <reference types="Cypress" />

const UserAction = require('../actions/user.action');

describe('user-view-blocklets-workflow.spec', () => {
  const userAction = new UserAction();

  it('The user successfully queried blocklet with keyword', () => {
    userAction.searchByKeyword({
      keyword: 'pay',
      blockletNames: ['payment-demo'],
    });
  });

  it('The user successfully queried blocklet with autocomplete ', () => {
    userAction.searchByAutoComplete({
      keyword: 'payment',
      blockletName: 'payment-demo',
    });
  });

  it('The user successfully queried blocklet by category', () => {
    userAction.searchByCategory({ category: 'Blog', blockletNames: ['static-demo'] });
  });

  it('After clicking the category tag of the blocklet details page, it should be filtered by category', () => {
    userAction.searchByDetailPageCategory({ category: 'Blog', blockletName: 'static-demo' });
  });

  it('After clicking the author tag of the blocklet details page, it should be filtered by author', () => {
    userAction.searchByDetailPageDeveloper({ blockletName: 'static-demo', blockletAuthor: 'wangshijun' });
  });

  it('The user successfully queried blocklet by free blocklet', () => {
    userAction.searchByFree({ blockletNames: ['static-demo'] });
  });

  it('The user successfully queried blocklet with order by', () => {
    userAction.searchBySort({
      orderBy: 'Latest Published',
      blockletNames: ['static-demo', 'payment-demo'],
    });
  });

  it('The user should successfully access the blocklet details page', () => {
    userAction.viewBlockletDetail({
      blockletName: 'payment-demo',
      blockletDescription: 'Demo blocklet that shows how developers earn crypto tokens by setting price for blocklets',
      blockletAuthor: 'wangshijun',
    });
  });

  it('The user should successfully access the blocklet versions page', () => {
    userAction.viewBlockletVersions({
      blockletName: 'payment-demo',
      changelogContent: '[skip ci] Update README.md',
    });
  });
});
