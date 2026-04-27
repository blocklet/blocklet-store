/* eslint-disable consistent-return */
const express = require('express');
const cache = require('express-cache-headers');
const { joinURL } = require('ufo');
const { isValid } = require('@arcblock/did');
const { createCredentialList } = require('@arcblock/vc');
const { get } = require('lodash-es');

const { createPurchaseDisplay } = require('../libs/nft/blocklet-nft/display');
const env = require('../libs/env');
const { wallet } = require('../libs/auth');
const Blocklet = require('../db/blocklet');
const { getChainClient } = require('../libs/utils');

const options = { ignoreFields: ['state.context'] };
const router = express.Router();

const ensureAsset = async (req, res, next) => {
  let asset = null;
  let vc = null;

  const client = getChainClient();
  if (req.query.asset) {
    asset = JSON.parse(req.query.asset);
    vc = asset.data?.value;
  } else {
    if (!req.query.assetId) {
      return res.status(400).send('Invalid request: missing nft asset id');
    }

    const { assetId } = req.query;
    if (isValid(assetId) === false) {
      return res.status(400).send('Invalid request: invalid nft asset id');
    }

    const { state } = await client.getAssetState({ address: assetId }, options);

    asset = state;
    vc = asset?.data?.value ? JSON.parse(asset?.data?.value) : null;
  }

  if (!asset) {
    return res.status(400).send('Invalid request: nft asset not found');
  }

  if (!vc || asset?.data?.typeUrl !== 'vc') {
    return res.status(400).send('Invalid request: nft asset is not a vc');
  }

  if (
    vc.type.includes('BlockletPurchaseCredential') === false &&
    vc.type.includes('RegistryDeveloperCredential') === false
  ) {
    return res
      .status(400)
      .send('Invalid request: nft asset is not a BlockletPurchaseCredential or RegistryDeveloperCredential');
  }
  req.asset = asset;
  req.client = client;
  req.vc = vc;

  next();
};

router.get('/display', cache({ ttl: 24 * 60 * 60 * 365 }), ensureAsset, async (req, res) => {
  const { vc, asset } = req;

  if (vc.type.includes('BlockletPurchaseCredential')) {
    res.type('svg');
    let assetValue = null;
    if (typeof get(asset, 'data.value') === 'string') {
      assetValue = JSON.parse(get(asset, 'data.value', '{}'));
    } else {
      assetValue = get(asset, 'data.value');
    }
    const did = get(assetValue, 'credentialSubject.purchased.blocklet.id');
    const blocklet = await Blocklet.findOne({ did });
    res.send(
      createPurchaseDisplay({
        asset,
        blocklet,
      })
    );
    return;
  }

  res.send('Not supported');
});

router.get('/status', ensureAsset, async (req, res) => {
  const { vc } = req;

  if (vc.type.includes('BlockletPurchaseCredential')) {
    const locale = req.query.locale || 'en';
    const translations = {
      zh: '查看 Blocklet',
      en: 'View Blocklet',
    };
    res.jsonp({
      id: vc.id,
      description: 'Actions of BlockletPurchaseCredential',
      actionList: await createCredentialList({
        issuer: { wallet, name: 'blocklet-registry-service' },
        claims: [
          {
            id: joinURL(env.appUrl, 'blocklets', get(vc, 'credentialSubject.purchased.blocklet.id')),
            type: 'navigate',
            name: 'view-blocklet',
            scope: 'public',
            label: translations[locale],
          },
        ],
      }),
    });
    return;
  }
  res.jsonp({});
});

// provide a nft show list for nft-store
router.get('/config', async (req, res) => {
  // Must get all blocklets which is a nft factory
  const blocklets = await Blocklet.find({
    $and: [
      { currentVersion: { $exists: true } },
      {
        currentVersion: { $ne: null },
        status: Blocklet.STATUS.NORMAL,
      },
    ],
  });
  const factoryList = blocklets.map((item) => {
    return item.currentVersion && item.meta;
  });
  const factories = factoryList.filter((item) => item?.nftFactory).map((item) => item.nftFactory);
  res.json({ purchaseFactoryAddresses: factories });
});

module.exports = router;
