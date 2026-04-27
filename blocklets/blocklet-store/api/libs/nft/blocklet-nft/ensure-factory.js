const { createNftFactoryItx } = require('./create-factory');
const { ensureFactoryCreated } = require('../utils/ensure-factory-created');
const { BLOCKLET_PURCHASE_TYPE } = require('../utils/constant');

const ensureNFTFactory = async () => {
  const factoryItx = await createNftFactoryItx();
  await ensureFactoryCreated(factoryItx, BLOCKLET_PURCHASE_TYPE);
};

module.exports = {
  ensureNFTFactory,
};
