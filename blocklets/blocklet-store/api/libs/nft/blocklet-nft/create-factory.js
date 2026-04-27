const { fromTokenToUnit } = require('@ocap/util');
const { isValidFactory } = require('@ocap/asset');
const { joinURL } = require('ufo');
const { toFactoryAddress } = require('@arcblock/did-util');
const env = require('../../env');
const { getToken } = require('./get-token');

const VERSION = '3.0.0';

const calcCreateNftFactoryItx = async () => {
  const token = await getToken();
  const serviceUrl = env.appUrl;

  const outputData = {
    type: 'vc',
    value: {
      '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
      id: '{{input.id}}',
      tag: ['{{input.did}}'],
      type: ['VerifiableCredential', 'PurchaseCredential', 'NFTCertificate', 'BlockletPurchaseCredential'],
      issuer: {
        id: '{{ctx.issuer.id}}',
        pk: '{{ctx.issuer.pk}}',
        name: '{{ctx.issuer.name}}',
      },
      issuanceDate: '{{input.issuanceDate}}',
      credentialSubject: {
        id: '{{ctx.owner}}',
        sn: '{{ctx.id}}',
        purchased: {
          blocklet: {
            id: '{{input.did}}',
            url: '{{{input.url}}}',
            name: '{{input.name}}',
          },
        },
        display: {
          type: 'url',
          content: joinURL(serviceUrl, '/api/nft/display'), // accept asset-did in query param
        },
      },
      credentialStatus: {
        id: joinURL(serviceUrl, '/api/nft/status'),
        type: 'NFTStatusList2021',
        scope: 'public',
      },
      proof: {
        type: '{{input.proofType}}',
        created: '{{input.issuanceDate}}',
        proofPurpose: 'assertionMethod',
        jws: '{{input.signature}}',
      },
    },
  };

  const amount = fromTokenToUnit(10 * 1000, token.decimal).toString();

  const itx = {
    name: 'Blocklet Purchase Factory',
    description: 'Purchase NFT factory for blocklet',
    settlement: 'instant',
    limit: 0,
    trustedIssuers: [env.appId],

    input: {
      tokens: [{ address: token.address, value: amount }],
      assets: [],
      variables: [
        {
          name: 'did',
          required: true,
        },
        {
          name: 'url',
          required: true,
        },
        {
          // 这个应该是 blocklet 的 title
          name: 'name',
          required: true,
        },
      ],
    },
    output: {
      issuer: '{{ctx.issuer.id}}',
      parent: '{{ctx.factory}}',
      moniker: 'BlockletPurchaseNFT',
      readonly: true,
      transferrable: false,
      data: outputData,
    },
    hooks: [
      {
        name: 'mint',
        type: 'contract',
        hook: `transferToken('${token.address}','${env.appId}','${amount}')`,
      },
    ],
    data: {
      type: 'json',
      value: {
        did: env.appId,
        url: serviceUrl,
        payment: {
          version: VERSION,
        },
      },
    },
  };

  itx.address = toFactoryAddress(itx);
  // @ts-expect-error FIXME: help wanted
  isValidFactory(itx, true);
  return itx;
};

let cache = null;
const createNftFactoryItx = async () => {
  if (!cache) {
    cache = await calcCreateNftFactoryItx();
  }
  return cache;
};

module.exports = {
  createNftFactoryItx,
};
