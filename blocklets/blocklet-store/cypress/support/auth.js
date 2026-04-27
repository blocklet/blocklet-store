/// <reference types="Cypress" />

/* eslint-disable no-console */
const assert = require('assert');
const axios = require('axios');
const url = require('url');
const stringify = require('json-stable-stringify');
const Mcrypto = require('@ocap/mcrypto');
const Client = require('@ocap/client');
const Jwt = require('@arcblock/jwt');
const { decodeAny } = require('@ocap/message'); // eslint-disable-line
const { proofTypes, create: createVC } = require('@arcblock/vc');
const { toBase58, toBase64, fromBase58 } = require('@ocap/util');
const { VC_TYPE_GENERAL_PASSPORT, VC_TYPE_NODE_PASSPORT } = require('@abtnode/constant');

const getStartPoint = (deepLink) => {
  const parsed = url.parse(deepLink, true);
  return decodeURIComponent(parsed.query.url);
};

const createStorePassport = async ({ claim, store, wallet, challenge, user }) => {
  const vc = stringify(
    await createVC({
      type: [VC_TYPE_GENERAL_PASSPORT, VC_TYPE_NODE_PASSPORT, 'VerifiableCredential'],
      issuer: {
        wallet: store,
        name: 'Blocklet Store',
      },
      subject: {
        id: wallet.address,
        passport: { name: user, title: user },
      },
    })
  );
  const presentation = {
    '@context': ['https://schema.arcblock.io/v0.1/context.jsonld'],
    challenge,
    type: proofTypes[Mcrypto.types.KeyType.ED25519], // holder wallet pk type
    verifiableCredential: [vc],
  };

  presentation.proof = {
    type: proofTypes[Mcrypto.types.KeyType.ED25519], // holder wallet pk type,
    created: new Date().toISOString(),
    proofPurpose: 'assertionMethod',
    pk: toBase58(wallet.publicKey),
    jws: toBase64(wallet.sign(stringify(presentation))),
  };

  claim.presentation = stringify(presentation);
  claim.assetDid = ''; // FIXME what is assetDid

  return claim;
};

const config = {
  owner: {
    walletFnName: 'getOwnerWallet',
    profileFnName: 'getOwnerProfile',
  },
  developer: {
    walletFnName: 'getOwnerWallet',
    profileFnName: 'getOwnerProfile',
  },
  user: {
    walletFnName: 'getUserWallet',
    profileFnName: 'getUserProfile',
  },
};

Cypress.Commands.add('getAuthUrl', () => {
  cy.wait(1000);
  cy.get('[data-did-auth-url]', { timeout: 6000 }).then((x) => {
    const deepLink = x.get(0).getAttribute('data-did-auth-url');
    const authUrl = getStartPoint(deepLink);
    console.log('getAuthUrl', authUrl);
    return authUrl;
  });
});

Cypress.Commands.add('login', (user = 'owner', { provideVC = true, force = false } = {}) => {
  const { walletFnName, profileFnName } = config[user];

  cy.clearCookie('connected_wallet_os');
  cy.getCookie('login_token').then((token) => {
    if (token && !force) {
      cy.log('login token', token);
    } else {
      cy.get('[data-cy="sessionManager-login"]').click({ force: true });
      cy.getStoreWallet().then((storeWallet) => {
        cy.getAuthUrl().then((authUrl) => {
          cy[walletFnName]().then((wallet) => {
            cy[profileFnName]().then(async (profile) => {
              let obj = new URL(authUrl);
              obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');

              const { data: info3 } = await axios.get(obj.href);
              assert.equal(await Jwt.verify(info3.authInfo, info3.appPk), true);
              const authInfo1 = Jwt.decode(info3.authInfo);
              console.log('login.step1: get requested claim', authInfo1);

              // 2. submit auth principal
              let claims = authInfo1.requestedClaims;
              let nextUrl = obj.href;
              let challenge = authInfo1.challenge; // eslint-disable-line
              if (claims.find((x) => x.type === 'authPrincipal')) {
                obj = new URL(authInfo1.url);
                obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
                const { data: info5 } = await axios.post(obj.href, {
                  userPk: toBase58(wallet.publicKey),
                  userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
                    requestedClaims: [],
                    challenge: authInfo1.challenge,
                  }),
                });
                const authInfo2 = Jwt.decode(info5.authInfo);
                console.log('login.step2: submit auth principal', authInfo2);
                claims = authInfo2.requestedClaims;
                challenge = authInfo2.challenge;
                nextUrl = authInfo2.url;
              }

              let claim = claims.find((x) => x.type === 'verifiableCredential');
              if (provideVC) {
                claim = await createStorePassport({
                  claim,
                  store: storeWallet,
                  wallet,
                  challenge,
                  user,
                });
              }

              const { data: info7 } = await axios.post(nextUrl, {
                userPk: toBase58(wallet.publicKey),
                userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
                  requestedClaims: [{ type: 'profile', ...profile }, { ...claim }],
                  challenge,
                }),
              });
              const authInfo3 = Jwt.decode(info7.authInfo);
              console.log('login.step3: submit profile info', authInfo3);
            });
          });
        });
      });
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.getCookie('login_token').then((token) => {
    if (token) {
      cy.log('login token', token);
      cy.get('[data-cy="sessionManager-logout-popup"]').click({ force: true });
      cy.get('[data-cy="sessionManager-logout-trigger"]').click({ force: true });
    } else {
      cy.wait(10);
    }
  });
});

Cypress.Commands.add('publishBlocklet', (user = 'owner') => {
  const { walletFnName } = config[user];

  cy.clearCookie('connected_wallet_os');
  cy.window().then((win) => {
    cy.getAuthUrl().then((authUrl) => {
      cy[walletFnName]().then(async (wallet) => {
        let obj = new URL(authUrl);
        obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');

        const { data: info3 } = await axios.get(obj.href);
        assert.equal(await Jwt.verify(info3.authInfo, info3.appPk), true);
        const authInfo1 = Jwt.decode(info3.authInfo);
        console.log('publish.step1: get requested claim', authInfo1);

        // 2. submit auth principal
        let claims = authInfo1.requestedClaims;
        let nextUrl = obj.href;
        let challenge = authInfo1.challenge; // eslint-disable-line
        if (claims.find((x) => x.type === 'authPrincipal')) {
          obj = new URL(authInfo1.url);
          obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
          const { data: info5 } = await axios.post(obj.href, {
            userPk: toBase58(wallet.publicKey),
            userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
              requestedClaims: [],
              challenge: authInfo1.challenge,
            }),
          });
          const authInfo2 = Jwt.decode(info5.authInfo);
          console.log('publish.step2: submit auth principal', authInfo2);
          claims = authInfo2.requestedClaims;
          challenge = authInfo2.challenge;
          nextUrl = authInfo2.url;
        }

        const metaClaim = claims.find((x) => x.type === 'signature' && x.typeUrl === 'mime:text/plain');
        metaClaim.sig = toBase58(wallet.sign(metaClaim.digest, false));

        const factoryClaim = claims.find((x) => x.type === 'signature' && x.typeUrl === 'fg:t:transaction');
        if (factoryClaim) {
          const client = new Client(win.blocklet.CHAIN_HOST);
          const tx = await client.decodeTx(fromBase58(factoryClaim.origin));
          const signed = await client.signCreateFactoryTx({ tx, wallet });
          factoryClaim.sig = toBase58(signed.signature);
        }

        const { data: info7 } = await axios.post(nextUrl, {
          userPk: toBase58(wallet.publicKey),
          userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
            requestedClaims: [metaClaim, factoryClaim].filter(Boolean),
            challenge,
          }),
        });
        const authInfo3 = Jwt.decode(info7.authInfo);
        console.log('publish.step3: submit signatures', authInfo3);

        cy.wait(1000);
        cy.contains('Success');
      });
    });
  });
});

Cypress.Commands.add('purchaseBlocklet', (user = 'owner') => {
  const { walletFnName } = config[user];

  cy.window().then((win) => {
    cy.getAuthUrl().then((authUrl) => {
      cy[walletFnName]().then(async (wallet) => {
        let obj = new URL(authUrl);
        obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');

        const { data: info3 } = await axios.get(obj.href);
        assert.equal(await Jwt.verify(info3.authInfo, info3.appPk), true);
        const authInfo1 = Jwt.decode(info3.authInfo);
        console.log('purchase.step1: get requested claim', authInfo1);

        // 2. submit auth principal
        let claims = authInfo1.requestedClaims;
        let nextUrl = obj.href;
        let challenge = authInfo1.challenge; // eslint-disable-line
        if (claims.find((x) => x.type === 'authPrincipal')) {
          obj = new URL(authInfo1.url);
          obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
          const { data: info5 } = await axios.post(obj.href, {
            userPk: toBase58(wallet.publicKey),
            userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
              requestedClaims: [],
              challenge: authInfo1.challenge,
            }),
          });
          const authInfo2 = Jwt.decode(info5.authInfo);
          console.log('purchase.step2: submit auth principal', authInfo2);
          claims = authInfo2.requestedClaims;
          challenge = authInfo2.challenge;
          nextUrl = authInfo2.url;
        }

        let tx;
        let itx;

        const claim = claims.find((x) => x.type === 'prepareTx');
        if (claim) {
          const client = new Client(win.blocklet.CHAIN_HOST);

          tx = await client.decodeTx(fromBase58(claim.partialTx));
          tx.signaturesList = [{ signer: wallet.address, pk: wallet.publicKey, signature: '' }];
          itx = decodeAny(tx.itx);
          tx.itx = { ...itx.value, inputsList: [{ owner: wallet.address, tokens: claim.requirement.tokens }] };

          tx = await client.multiSignAcquireAssetV3Tx({ tx, wallet });
          tx = await client.signAcquireAssetV3Tx({ tx, wallet, encoding: 'base58' });

          const final = await client.decodeTx(fromBase58(tx));
          console.log('tx', final, decodeAny(final.itx));

          claim.finalTx = tx;
        }

        const { data: info7 } = await axios.post(nextUrl, {
          userPk: toBase58(wallet.publicKey),
          userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
            requestedClaims: [claim],
            challenge,
          }),
        });
        const authInfo3 = Jwt.decode(info7.authInfo);
        console.log('purchase.step3: submit signatures', authInfo3);

        cy.wait(1000);
        cy.contains('Success');

        cy.request(`/api/nft/display?assetId=${itx.value.address}`).then((res) => {
          expect(res.body.indexOf('Permanent') > 0).to.equal(true);
          expect(res.body.indexOf('payment-demo') > 0).to.equal(true);
        });
        cy.wait(500);
      });
    });
  });
});

Cypress.Commands.add('openAdmin', (toPath) => {
  cy.log('toPath', toPath);

  cy.location('pathname').then((pathname) => {
    if (pathname.includes('/console/') || pathname.includes('/developer/')) {
      cy.visit(toPath);
    } else {
      // 使得e2e测试更加稳定
      cy.waitUntil(() =>
        cy
          .get('[data-cy="sessionManager-logout-popup"]')
          .click({ force: true })
          .then(() => Cypress.$(':contains(Manage)').length)
      );
      cy.contains('Manage').should('exist').click({ force: true });
      if (toPath) {
        cy.visit(toPath);
      }
    }
  });
});

Cypress.Commands.add('enableAutoPublishBlocklet', (user = 'owner') => {
  const { walletFnName } = config[user];

  cy.clearCookie('connected_wallet_os');
  cy.window().then((win) => {
    cy.getAuthUrl().then((authUrl) => {
      cy[walletFnName]().then(async (wallet) => {
        cy.log('enableAutoPublishBlocklet', {
          win,
          authUrl,
          wallet,
        });

        // 1: 模拟扫码
        let obj = new URL(authUrl);
        obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
        const { data: info3 } = await axios.get(obj.href);
        assert.equal(await Jwt.verify(info3.authInfo, info3.appPk), true);
        const authInfo1 = Jwt.decode(info3.authInfo);
        console.log('publish.step1: get requested claim', authInfo1);

        // 2. 应用告诉钱包接下来需要干嘛?
        let claims = authInfo1.requestedClaims;
        let nextUrl = obj.href;
        let challenge = authInfo1.challenge; // eslint-disable-line
        if (claims.find((x) => x.type === 'authPrincipal')) {
          obj = new URL(authInfo1.url);
          obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
          const { data: info5 } = await axios.post(obj.href, {
            userPk: toBase58(wallet.publicKey),
            userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
              requestedClaims: [],
              challenge: authInfo1.challenge,
            }),
          });
          const authInfo2 = Jwt.decode(info5.authInfo);
          console.log('publish.step2: submit auth principal', authInfo2);
          claims = authInfo2.requestedClaims;
          challenge = authInfo2.challenge;
          nextUrl = authInfo2.url;
        }

        cy.log('enableAutoPublishBlocklet', {
          claims,
        });

        const metaClaim = claims.find((x) => x.type === 'signature' && x.typeUrl === 'mime:text/plain');
        metaClaim.sig = toBase58(wallet.sign(fromBase58(metaClaim.origin)));

        // 3. 回答store的问题
        const { data: info7 } = await axios.post(nextUrl, {
          userPk: toBase58(wallet.publicKey),
          userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
            requestedClaims: [metaClaim].filter(Boolean),
            challenge,
          }),
        });
        const authInfo3 = Jwt.decode(info7.authInfo);
        console.log('publish.step3: submit signatures', authInfo3);

        cy.contains('Success');
      });
    });
  });
});

Cypress.Commands.add('verifyPurchaseBlocklet', ({ tokenUrl, user }) => {
  const { walletFnName } = config[user ?? 'owner'];

  // 创建did connect会话
  cy.request(tokenUrl).then((response) => {
    const authUrl = getStartPoint(response.body.url);

    cy.clearCookie('connected_wallet_os');
    cy.window().then((win) => {
      cy[walletFnName]().then(async (wallet) => {
        cy.log('verifyPurchaseBlocklet', {
          win,
          authUrl,
          wallet,
        });

        // 1: 模拟扫码
        let obj = new URL(authUrl);
        obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
        const { data: info3 } = await axios.get(obj.href);
        assert.equal(await Jwt.verify(info3.authInfo, info3.appPk), true);
        const authInfo1 = Jwt.decode(info3.authInfo);
        console.log('publish.step1: get requested claim', authInfo1);

        // 2. 应用告诉钱包接下来需要干嘛?
        let claims = authInfo1.requestedClaims;
        let nextUrl = obj.href;
        let challenge = authInfo1.challenge; // eslint-disable-line
        if (claims.find((x) => x.type === 'authPrincipal')) {
          obj = new URL(authInfo1.url);
          obj.searchParams.set('user-agent', 'ArcWallet/3.0.0');
          const { data: info5 } = await axios.post(obj.href, {
            userPk: toBase58(wallet.publicKey),
            userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
              requestedClaims: [],
              challenge: authInfo1.challenge,
            }),
          });
          const authInfo2 = Jwt.decode(info5.authInfo);
          console.log('publish.step2: submit auth principal', authInfo2);
          claims = authInfo2.requestedClaims;
          challenge = authInfo2.challenge;
          nextUrl = authInfo2.url;
        }

        cy.log('enableAutoPublishBlocklet', {
          claims,
        });

        // 3. 回答store的问题
        const { data: info7 } = await axios.post(nextUrl, {
          userPk: toBase58(wallet.publicKey),
          userInfo: await Jwt.sign(wallet.address, wallet.secretKey, {
            requestedClaims: [],
            challenge,
          }),
        });
        const authInfo3 = Jwt.decode(info7.authInfo);

        console.log(info7);
        console.log('publish.step3: submit signatures', authInfo3);
      });
    });
  });
});
