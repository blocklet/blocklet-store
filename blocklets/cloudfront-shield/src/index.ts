/* eslint-disable import/prefer-default-export */
import { Context, Callback } from 'aws-lambda';
import { verifyDownloadToken } from '@blocklet/util';
import axios from 'axios';
import Headers from './classes/headers';
import { ViewRequestEvent, BlockletMeta } from './types';

const isFreeBlocklet = (blockletMeta: BlockletMeta): boolean => {
  if (!blockletMeta?.payment) {
    return true;
  }

  const priceList = (blockletMeta.payment.price || []).map((x) => x.value || 0);
  return priceList.every((x) => x === 0);
};

/**
 *
 * @website https://dm139eo9o82m8.cloudfront.net
 * @see https://github.com/blocklet/did-services/blob/master/packages/did-gateway/libs/index.js
 * @see https://docs.aws.amazon.com/zh_cn/AmazonCloudFront/latest/DeveloperGuide/field-level-encryption.html#field-level-encryption-overview
 * @see https://docs.aws.amazon.com/zh_cn/lambda/latest/dg/typescript-package.html#aws-cli-ts
 * @param {ViewRequestEvent} event
 * @param {Context} context
 * @param {Callback} callback
 * @return {*}
 */
async function handler(event: ViewRequestEvent, context: Context, callback: Callback) {
  try {
    const { request } = event.Records[0].cf;

    const headers = new Headers(request.headers);
    const body = { event, context };

    if (headers.get('x-enable-debug')) {
      return callback(null, {
        status: 200,
        body: JSON.stringify(
          Object.assign(body, {
            params: {
              env: process.env,
              blockletDid: headers.get('x-blocklet-did'),
              downloadToken: headers.get('x-download-token'),
              storePublicKey: headers.get('x-store-public-key'),
              serverDid: headers.get('x-server-did'),
              serverPublicKey: headers.get('x-server-public-key'),
              serverSignature: headers.get('x-server-signature'),
            },
          })
        ),
      });
    }

    const storePublicKey: string = request.origin.custom.customHeaders['x-store-public-key']?.[0]?.value;
    if (!storePublicKey) {
      throw new Error('x-store-public-key must be set');
    }

    if (request.method !== 'GET' || !request.uri.endsWith('.tgz')) {
      return callback(null, request);
    }

    // 解析blocklet的did和版本
    // demo:https://xxxxx.did.abtnet.io/api/blocklets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/0.15.16/z2qa6cVUn2fb8HNURw8wNFEYjas8Np4vxNRzy-0.15.16.tgz
    // demo:https://xxxxx.did.abtnet.io/api/blocklets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/z2qa6cVUn2fb8HNURw8wNFEYjas8Np4vxNRzy-0.15.16.tgz
    const matchArray = request.uri.match(/api\/blocklets\/([^/]+)\/(\d+\.\d+.\d+)?/);
    const blockletDid = matchArray?.[1];
    const version = matchArray?.[2];

    // 获得store的host
    const storeHost = headers.get('host');

    // 查询blocklet的meta
    const { data: blockletMeta } = await axios.get<BlockletMeta>(
      `https://${storeHost}/api/blocklets/${blockletDid}${version ? `/${version}` : ''}/blocklet.json`
    );

    if (isFreeBlocklet(blockletMeta)) {
      return callback(null, request);
    }

    const verifyDownloadTokenParams = {
      blockletDid,
      downloadToken: headers.get('x-download-token'),
      storePublicKey,
      serverDid: headers.get('x-server-did'),
      serverPublicKey: headers.get('x-server-public-key'),
      serverSignature: headers.get('x-server-signature'),
    };

    await verifyDownloadToken(verifyDownloadTokenParams);

    return callback(null, request);
  } catch (error) {
    return callback(null, {
      status: 400,
      body: error.message,
    });
  }
}

export { handler };
