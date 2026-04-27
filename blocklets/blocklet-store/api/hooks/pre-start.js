/* eslint-disable no-console */
const fs = require('fs-extra');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromUnitToToken, toBN } = require('@ocap/util');

const { client, wallet, service } = require('../libs/auth');
const { tempUploadDir, blockletRootDir, assetsDir, mediaDir } = require('../libs/env');
const { ensureNFTFactory } = require('../libs/nft/blocklet-nft/ensure-factory');
const MeiliSearchClient = require('../libs/meilisearch');
const env = require('../libs/env');

const ensureAccountStaked = async () => {
  const stakeAddress = toStakeAddress(wallet.address, wallet.address);
  const { state } = await client.getStakeState({ address: stakeAddress }, { ignoreFields: ['context'] });

  if (state) {
    console.info('already staked for gas on chain');
    return;
  }

  const { state: account } = await client.getAccountState({ address: wallet.address }, { ignoreFields: ['context'] });
  const result = await client.getForgeState({});
  const { token, txConfig } = result.state;
  const holding = account?.tokens?.find((x) => x.address === token.address);
  if (toBN(holding?.value || '0').lte(toBN(txConfig.txGas.minStake))) {
    const minStake = fromUnitToToken(txConfig.txGas.minStake, token.decimal);
    console.info(
      `Account ${wallet.address} does not have enough balance to stake for gas. Please transfer at least ${minStake} ${token.symbol} to this address.`
    );
    return;
  }

  const hash = await client.stake({
    to: wallet.address,
    message: 'stake-for-gas',
    tokens: [{ address: token.address, value: fromUnitToToken(txConfig.txGas.minStake, token.decimal) }],
    wallet,
  });
  console.info('staked for gas on chain', hash);
};

async function verifyIndexSettings() {
  await MeiliSearchClient.waitForMeilisearch();
  console.info('meilisearch is running');
  await MeiliSearchClient.verifyIndexSettings();
}

async function ensureDeveloperRoleCreated() {
  const { roles } = await service.getRoles();
  if (roles.some((role) => role.name === 'developer')) {
    console.info('The role "developer" already exists.');
  } else {
    await service.createRole({
      name: 'developer',
      title: 'Developer',
      description: 'Use this passport to connect Blocklet Store as Developer',
    });
    console.info('The role "developer" has been created successfully.');
  }
}

const ensureDirs = () => {
  fs.ensureDirSync(tempUploadDir);
  fs.ensureDirSync(blockletRootDir);
  fs.ensureDirSync(assetsDir);
  fs.ensureDirSync(mediaDir);
};

(async () => {
  try {
    await ensureAccountStaked();
    await ensureDirs();
    if (env.preferences.allowPaidBlocklets) {
      await ensureNFTFactory();
    }
    try {
      await verifyIndexSettings();
    } catch (err) {
      console.error('failed to verifyIndexSettings', err);
    }
    await ensureDeveloperRoleCreated();
    // HACK: 必须加上，否则会卡在 pre-start 阶段
    process.exit(0);
  } catch (err) {
    console.error('pre-start error', err);
    process.exit(1);
  }
})();
