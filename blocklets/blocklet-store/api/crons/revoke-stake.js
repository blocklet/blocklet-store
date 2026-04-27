const assert = require('assert');
const { toStakeAddress } = require('@arcblock/did-util');
const { toBN, fromTokenToUnit } = require('@ocap/util');

const { client, service, wallet } = require('../libs/auth');
const logger = require('../libs/logger');
const { event, Events } = require('../events');
const Blocklet = require('../db/blocklet');
const env = require('../libs/env');
const { getGasPayerExtra } = require('../libs/utils');

async function getAllResults(dataKey, fn) {
  const results = [];
  const pageSize = 40;

  const { page, [dataKey]: firstPage } = await fn({ size: pageSize });
  if (page.total < pageSize) {
    return firstPage;
  }

  results.push(...firstPage);

  const total = Math.floor(page.total / pageSize);
  const tasks = [];
  for (let i = 1; i <= total; i++) {
    tasks.push(async () => {
      const { [dataKey]: nextPage } = await fn({ size: pageSize, cursor: i * pageSize });
      results.push(...nextPage);
    });
  }
  await Promise.all(tasks.map((x) => x()));
  assert.equal(results.length, page.total, `fetched ${dataKey} count does not match`);

  return results;
}

async function checkStakeRevokeTx() {
  const interval = 1000 * 60 * 10;
  const startDateTime = new Date(Date.now() - interval).toISOString();
  const endDateTime = new Date().toISOString();

  const txs = await getAllResults('transactions', (paging) =>
    client.listTransactions({
      paging,
      typeFilter: { types: ['revoke_stake'] },
      timeFilter: {
        field: 'time',
        startDateTime,
        endDateTime,
      },
    })
  );

  logger.info(`Found ${txs.length} revoke stake tx on chain`, {
    interval,
    startDateTime,
    endDateTime,
    txs: txs.map((x) => x.hash),
  });

  await Promise.all(
    txs.map(async (t) => {
      const { state } = await client.getStakeState({ address: t.tx.itxJson.address });
      if (state.receiver !== wallet.address) {
        return;
      }

      logger.info('revoked stake found on chain', {
        address: state.address,
        developer: state.sender,
        nonce: state.nonce,
        txHash: t.hash,
      });

      const data = JSON.parse(state.data?.value || '{}');

      // revoke developer passport stake
      if (data?.purpose === 'passport') {
        const { user } = await service.getUser(state.sender, { enableConnectedAccount: true });
        if (!user) {
          return;
        }

        await Promise.all(
          user.passports
            .filter((x) => x.role === 'developer')
            .map((x) => service.revokeUserPassport({ userDid: state.sender, passportId: x.id }))
        );

        event.emit(Events.DEVELOPER_STAKE_REVOKED, {
          userDid: state.sender,
          txHash: t.hash,
        });

        logger.info('developer stake revoked', {
          address: state.address,
          developer: state.sender,
          txHash: t.hash,
          passports: user.passports.filter((x) => x.role === 'developer').map((x) => x.id),
        });
      }

      // revoke blocklet publish stake
      if (data?.purpose === 'publish') {
        const blockletDid = data.blocklet;

        const blocklet = await Blocklet.findOne({ did: blockletDid });
        if (blocklet && blocklet.status !== Blocklet.STATUS.BLOCKED) {
          event.emit(Events.BLOCKLET_STAKE_REVOKED, {
            sender: state.sender,
            blockletDid,
            txHash: t.hash,
          });

          await Blocklet.update(
            { did: blockletDid },
            {
              $set: {
                status: Blocklet.STATUS.BLOCKED,
                blockReason: 'publish stake revoked by developer',
              },
            }
          );

          event.emit(Events.BLOCKLET_BLOCKED, {
            blockletDid,
            blockletId: blocklet.id,
            locale: 'en',
          });

          logger.info('blocklet blocked on stake revoked', {
            address: state.address,
            developer: state.sender,
            txHash: t.hash,
            blockletDid,
          });
        }
      }
    })
  );
}

const slashOnBlock = async (blockletId) => {
  const blocklet = await Blocklet.findOne({ id: blockletId });
  if (!blocklet) {
    logger.warn('Stake slashing aborted because blocklet not found', { blockletId });
    return;
  }

  // check the staking
  const nonce = `blocklet:${blocklet.did}`;
  const address = toStakeAddress(blocklet.did, wallet.address, nonce);
  const result = await client.getStakeState({ address });
  if (!result.state) {
    logger.warn('Stake slashing aborted because no staking state', { blockletId, address, nonce });
    return;
  }

  // check for staking for amount
  const { state } = await client.getForgeState({});
  const staked = result.state.tokens.find((x) => x.address === state.token.address);
  const revoked = result.state.revokedTokens.find((x) => x.address === state.token.address);
  let total = toBN(0);
  if (staked) {
    total = total.add(toBN(staked.value));
  }
  if (revoked) {
    total = total.add(toBN(revoked.value));
  }
  let amount = fromTokenToUnit(+env.preferences.publishStakeAmount, state.token.decimal).toString();
  if (total.lt(toBN(amount))) {
    logger.warn('Stake slashing continue without enough staking', { blockletId, address, staked, revoked });
    amount = total.toString();
  } else {
    logger.info('Stake slashing continue with enough staking', { blockletId, address, staked, revoked });
  }

  // do the slash
  const signed = await client.signSlashStakeTx({
    tx: {
      itx: {
        address,
        outputs: [{ owner: wallet.address, tokens: [{ address: state.token.address, value: amount }] }],
        message: 'blocklet-blocked',
        data: {
          typeUrl: 'json',
          // @ts-ignore
          value: {
            appId: wallet.address,
            reason: 'blocklet-blocked',
            blockletDid: blocklet.did,
          },
        },
      },
    },
    wallet,
  });
  const { buffer } = await client.encodeSlashStakeTx({ tx: signed });
  const txHash = await client.sendSlashStakeTx({ tx: signed, wallet }, await getGasPayerExtra(buffer));
  logger.info('Stake slashing done for blocklet', { blockletId, amount, address, txHash });
};

module.exports = { checkStakeRevokeTx, slashOnBlock };
