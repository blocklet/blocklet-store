/* eslint-disable no-console */
const { wallet, client } = require('../../auth');
const { DEVELOPER_CERTIFICATE_TYPE } = require('./constant');

const getAccountStateOptions = { ignoreFields: [/\.withdrawItems/, /\.items/] };

const ensureFactoryCreated = async (itx, type = DEVELOPER_CERTIFICATE_TYPE) => {
  const { state } = await client.getFactoryState({ address: itx.address }, { ...getAccountStateOptions });
  if (!state) {
    const hash = await client.sendCreateFactoryTx({ tx: { itx }, wallet });
    console.info(`${type} factory created on chain ${itx.address}`, hash);
  } else {
    console.info(`${type} factory exist on chain ${itx.address}`);
  }
  return state;
};

module.exports = {
  ensureFactoryCreated,
};
