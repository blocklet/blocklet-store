/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const dotenv = require('dotenv-flow');

dotenv.config();

const { joinURL } = require('ufo');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const Jwt = require('@arcblock/jwt');
const { types } = require('@ocap/mcrypto');
const { fromRandom, WalletType } = require('@ocap/wallet');
const { toBase58, toBuffer } = require('@ocap/util');
const { base32 } = require('multiformats/bases/base32');
const { getApplicationWallet } = require('@blocklet/meta/lib/wallet');
const { parse } = require('@blocklet/meta/lib/parse');

const meta = parse(path.dirname(__dirname));

const encodeBase32 = (did) => base32.encode(toBuffer(did));

const server = fromRandom(
  WalletType({
    role: types.RoleType.ROLE_APPLICATION,
    pk: types.KeyType.ED25519,
    hash: types.HashType.SHA3,
  })
);

const getAppDomain = () => {
  const wallet = getApplicationWallet(meta.did, server.secretKey);
  return `${encodeBase32(wallet.address)}.did.abtnet.io`.toLowerCase();
};

async function ensureWallet(name) {
  const file = path.join(process.cwd(), `.cypress/${name}.json`);
  fs.mkdirpSync(path.dirname(file));

  if (fs.existsSync(file)) {
    const json = JSON.parse(fs.readFileSync(file).toString());
    console.log(`Reuse existing ${name} wallet`, json);
    return;
  }

  let wallet = null;
  if (name === 'store') {
    wallet = getApplicationWallet(meta.did, server.secretKey);
  } else {
    wallet = fromRandom(
      WalletType({
        role: types.RoleType.ROLE_ACCOUNT,
        pk: types.KeyType.ED25519,
        hash: types.HashType.SHA3,
      })
    );
  }

  fs.writeFileSync(file, JSON.stringify(wallet.toJSON()));
  console.log(`Generate new ${name} wallet`, JSON.stringify(wallet.toJSON()));

  const faucetHost = 'https://faucet.abtnetwork.io';
  const { data: tokens } = await axios.get(joinURL(faucetHost, '/api/tokens'), { timeout: 8000 });
  const symbols = ['TBA', 'PLAY3'];
  for (const symbol of symbols) {
    const token = tokens.find((x) => x.symbol === symbol);
    try {
      await axios.post(
        joinURL(faucetHost, '/api/claim'),
        {
          userPk: toBase58(wallet.publicKey),
          userInfo: await Jwt.sign(wallet.address, wallet.secretKey, { token: token.address }),
        },
        { timeout: 8000 }
      );
      console.log(`Fund ${symbol} to ${name} wallet`, wallet.address);
    } catch (e) {
      console.log(`Fund ${symbol} to ${name} wallet failed`, wallet.address);
    }
  }
}

function ensureDotEnvForE2E() {
  const file = path.join(process.cwd(), '.env.e2e');
  if (fs.existsSync(file)) {
    console.log('Reuse existing .env.e2e');
    return;
  }

  const appUrl = `https://${getAppDomain()}`;

  fs.writeFileSync(
    file,
    `SHARE_REQUIREMENT=0.3
TEST_SERVER_SK="${server.secretKey}"
CHAIN_HOST="https://main.abtnetwork.io/api/"
STORE_URL="${appUrl}"
NODE_TLS_REJECT_UNAUTHORIZED="0"
`
  );
  console.log('Generate .env.e2e', fs.readFileSync(file).toString());

  const config = path.join(process.cwd(), 'cypress.json');
  fs.writeFileSync(
    config,
    JSON.stringify(
      {
        baseUrl: appUrl,
        viewportHeight: 1280,
        viewportWidth: 1560,
        defaultCommandTimeout: 40000,
        video: false,
        testFiles: ['*workflow.spec.js'],
        env: {
          FAIL_FAST: true,
          codeCoverage: {
            url: `${appUrl}/__coverage__`,
          },
        },
        experimentalStudio: true,
      },
      null,
      2
    )
  );
}

// Note: react-scripts does not run as expected when NODE_ENV is not `development`
function ensureDotEnvForDev() {
  const file = path.join(process.cwd(), '.env.development');
  if (fs.existsSync(file)) {
    console.log('Reuse existing .env.development');
    return;
  }

  fs.copyFileSync(path.join(process.cwd(), '.env.e2e'), file);
  console.log('Copy .env.e2e ==> .env.development');
}

ensureWallet('store');
ensureWallet('owner');

ensureDotEnvForE2E();
ensureDotEnvForDev();
