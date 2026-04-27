/// <reference types="Cypress" />

const { adminAction } = require('../actions/admin.action');
const CategoryAction = require('../actions/category.action');

describe('admin-manage-category-workflow.spec', () => {
  before(() => {
    cy.visit('/');
    adminAction.loginAsOwner();
  });

  it('category should be managed normally', () => {
    CategoryAction.createDefaultCategorys().add({
      englishName: 'test233',
      chineseName: '测试233',
    });
    CategoryAction.update('test233', { newEnglishName: 'new test233', newChineseName: '新测试 233' });
    CategoryAction.deleteByEnglishName('new test233');
  });
});
