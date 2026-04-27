const express = require('express');
const { toBase58 } = require('@ocap/util');
const { verify, decode } = require('@arcblock/jwt');
const { verifyPaymentIntegrity, verifyNftFactory } = require('@blocklet/meta/lib/payment/v2');
const { validateMeta } = require('@blocklet/meta/lib/validate');

const logger = require('../libs/logger');
const { getVCFromClaim, signDownloadToken, PurchaseVcTypes } = require('../libs/utils');
const { wallet, client } = require('../libs/auth');

const router = express.Router();

const getIssuer = async ({ pk, token }) => {
  if (!(await verify(token, pk))) {
    throw new Error('failed verify vc issuer signature');
  }
  const { iss } = decode(token);
  return iss.replace('did:abt:', '');
};

router.post('/signature', async (req, res) => {
  try {
    const { blockletMeta, paymentIntegrity: integrity } = req.body || {};

    if (!integrity) {
      throw new Error('paymentIntegrity should not be empty');
    }

    validateMeta(blockletMeta);

    // FIXME: verifyPaymentIntegrity 方法需要改进：当发现组件所在的 store 中没有 storeId 时，直接报错
    await verifyPaymentIntegrity({
      integrity,
      blockletMeta,
      ocapClient: client,
      storeId: wallet.address,
    });

    res.json({
      signer: wallet.address,
      pk: toBase58(wallet.publicKey),
      signature: await wallet.sign(integrity),
    });
  } catch (err) {
    logger.error(`verify payment integrity failed: ${err.message}`);
    res.status(400).send(`verify payment integrity failed: ${err.message}`);
  }
});

router.post('/download-token', async (req, res) => {
  try {
    const { userDid, serverDid, vcClaim, vcIssuer, challenge } = req.body || {};

    const issuerId = await getIssuer(vcIssuer);

    const { vc, assetDid } = await getVCFromClaim({
      claim: vcClaim,
      challenge,
      trustedIssuers: [issuerId],
      vcTypes: PurchaseVcTypes,
    });

    if (vc.issuer.id !== issuerId) {
      throw new Error(`invalid vc issuer. expect: ${vc.issuer.id}, actual: ${issuerId}`);
    }

    if (!assetDid) {
      throw new Error('nft not found in vc claim');
    }

    const { state: assetState } = await client.getAssetState({ address: assetDid });

    if (!assetState) {
      throw new Error(`nft does not exist on chain: ${assetDid}`);
    }

    const factoryDid = assetState.parent;

    if (!factoryDid) {
      throw new Error('factoryDid not found in nft');
    }

    const { state: factoryState } = await client.getFactoryState({ address: factoryDid });

    if (!factoryState) {
      throw new Error(`nft factory does not exist on chain: ${factoryState}`);
    }

    const { components } = await verifyNftFactory({
      factoryState,
      signerWallet: wallet,
    });

    const downloadTokens = await Promise.all(
      components
        .map((x) => x.did)
        .map(async (componentDid) => ({
          did: componentDid,
          token: await signDownloadToken({
            wallet,
            blockletDid: componentDid,
            serverDid,
            userDid,
          }),
        }))
    );

    logger.info('/download-token: downloadTokens', { dids: downloadTokens.map((x) => x.did) });

    res.json({ downloadTokens });
  } catch (err) {
    logger.error(`get download token failed: ${err.message}`);
    res.status(400).send(`get download token failed: ${err.message}`);
  }
});

module.exports = router;
