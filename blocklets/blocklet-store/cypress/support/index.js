require('./commands');
require('./user');
require('./auth');

Cypress.on('uncaught:exception', (err) => {
  // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    // returning false here prevents Cypress from failing the test
    return false;
  }

  return true;
});

Cypress.Cookies.defaults({
  preserve: ['nf_lang', 'connected_did', 'connected_pk', 'login_token'],
});

window.localStorage.clear();
Cypress.LocalStorage.clear = () => {
  // eslint-disable-next-line no-useless-return
  return;
};
