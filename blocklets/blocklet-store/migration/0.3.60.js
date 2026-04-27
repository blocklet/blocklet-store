/* eslint-disable no-await-in-loop */
require('dotenv-flow').config();
const AccessToken = require('../api/db/access-token');
const Blocklet = require('../api/db/blocklet');
const BlockletVersion = require('../api/db/blocklet-version');
const { getBlockletMeta } = require('../api/libs/blocklet');

async function _genBlockletVersion(blockletItem) {
  const { versions = [] } = blockletItem;
  const versionList = versions.map((version) => ({
    did: blockletItem.did,
    version: version.version,
    uploadedAt: version.published_at,
  }));
  await BlockletVersion.insert(versionList);
}

async function _genAccessToken(blockletItem, version, userDid) {
  const { signatures } = await getBlockletMeta(blockletItem.did, version);
  const localSignature = signatures[signatures.length - 1];
  const { pk, signer } = localSignature;
  await AccessToken.update(
    { _id: signer },
    {
      $set: {
        _id: signer,
        publicKey: pk,
        secretKey: 'Generate from migration',
        remark: 'Generate from migration',
        userDid,
        status: AccessToken.STATUS.NORMAL,
      },
    },
    {
      upsert: true,
    }
  );
}
async function _genBlocklet(blockletItem, ownerDid) {
  const currentVersion =
    blockletItem.currentVersion?.version &&
    (await BlockletVersion.findOne({
      did: blockletItem.did,
      version: blockletItem.currentVersion.version,
    }));
  const latestVersion =
    blockletItem.latestVersion?.version &&
    (await BlockletVersion.findOne({
      did: blockletItem.did,
      version: blockletItem.latestVersion.version,
    }));
  const tempItem = {
    _id: blockletItem._id,
    did: blockletItem.did,
    name: blockletItem.name,
    owner: {
      ...blockletItem.owner,
      did: ownerDid,
    },
    createdAt: blockletItem.createdAt,
    updatedAt: blockletItem.updatedAt,
    status: Blocklet.STATUS.NORMAL,
    stats: blockletItem.stats || {
      downloads: 0,
    },
    currentVersion: currentVersion?._id,
    latestVersion: latestVersion?._id,
    draftVersion: null,
  };
  await Blocklet.insert(tempItem);
  if (currentVersion) {
    await _genAccessToken(blockletItem, currentVersion.version, ownerDid);
  }
}

module.exports = async () => {
  // ownerDid generate from auth-demo
  const ownerDid = process.env.OWNER_DID;
  if (!ownerDid) {
    throw new Error("Can't find OWNER_DID in env");
  }
  const blockletList = await Blocklet.find();
  await Blocklet.remove({}, { multi: true });
  await BlockletVersion.remove({}, { multi: true });
  for (const blockletItem of blockletList) {
    await _genBlockletVersion(blockletItem);
    await _genBlocklet(blockletItem, ownerDid);
  }
};
