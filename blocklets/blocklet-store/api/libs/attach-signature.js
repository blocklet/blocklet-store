const { toBase58 } = require('@ocap/util');
const { fromPublicKey } = require('@ocap/wallet');
const stableStringify = require('json-stable-stringify');
const { wallet } = require('./auth');
const env = require('./env');

/**
 *
 * @description 附加delegation token的签名,developer委托store去做签名.
 * @see https://github.com/blocklet/blocklet-store/issues/108
 * @param {object} blockletMeta
 * @param {string} userPk
 * @param {string} delegationToken
 */
async function attachDelegationSignature(blockletMeta, userPk, delegationToken) {
  const developerWallet = fromPublicKey(userPk).toJSON();
  const storeWallet = wallet.toJSON();

  try {
    const signatureData = {
      type: developerWallet.type.pk,
      name: blockletMeta.name,
      signer: developerWallet.address,
      pk: toBase58(developerWallet.pk),
      delegatee: storeWallet.address,
      delegateePk: toBase58(storeWallet.pk),
      delegation: delegationToken,
      excludes: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
      appended: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
      created: new Date().toISOString(),
    };
    blockletMeta.signatures ||= [];
    blockletMeta.signatures.unshift(signatureData);
    const sig = toBase58(await wallet.sign(stableStringify(blockletMeta)));

    blockletMeta.signatures[0].sig = sig;
  } catch (error) {
    throw new Error('function attachDelegationSignature failed');
  }
}

/**
 *
 * @description 附加store的签名
 * @param {*} blockletMeta
 */
async function attachStoreSignature(blockletMeta) {
  const json = wallet.toJSON();
  try {
    const signatureData = {
      type: json.type.pk,
      name: env.appName,
      signer: json.address,
      pk: toBase58(json.pk),
      excludes: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
      appended: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
      created: new Date().toISOString(),
    };
    blockletMeta.signatures.unshift(signatureData);
    const sig = toBase58(await wallet.sign(stableStringify(blockletMeta)));

    blockletMeta.signatures[0].sig = sig;
  } catch (error) {
    throw new Error('function attachStoreSignature failed');
  }
}

module.exports = {
  attachDelegationSignature,
  attachStoreSignature,
};
