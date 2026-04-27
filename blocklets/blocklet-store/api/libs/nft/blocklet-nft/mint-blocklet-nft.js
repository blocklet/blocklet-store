const { createNftFactoryItx } = require('./create-factory');
const { wallet, client } = require('../../auth');

const mintBlockletNFT = async ({ ownerDid, blockletDid, url, name }) => {
  const itx = await createNftFactoryItx();
  const preMint = await client.preMintAsset({
    factory: itx.address,
    inputs: {
      did: blockletDid,
      url,
      name,
    },
    owner: ownerDid,
    wallet,
  });

  const hash = await client.sendMintAssetTx({ tx: { itx: preMint }, wallet });

  return { hash, address: preMint.address };
};

module.exports = {
  mintBlockletNFT,
};
