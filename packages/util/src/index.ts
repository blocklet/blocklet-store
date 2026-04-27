/* eslint-disable import/prefer-default-export */
import { verify, decode, JwtBody } from '@arcblock/jwt';
import { isFromPublicKey } from '@arcblock/did';
import isEmpty from 'lodash-es/isEmpty';
import { calcAdd } from './calc';

export * from './calc';

// eslint-disable-next-line require-await
export async function verifyDownloadToken({
  blockletDid,
  downloadToken,
  storePublicKey,
  serverDid,
  serverPublicKey,
  serverSignature,
}: {
  blockletDid: string;
  downloadToken: string;
  storePublicKey: string;
  serverDid: string;
  serverPublicKey: string;
  serverSignature: string;
}): Promise<void> {
  if (isEmpty(downloadToken)) {
    throw new Error('downloadToken must be provided');
  }

  if (!(await verify(downloadToken, storePublicKey))) {
    throw new Error('downloadToken is invalid');
  }

  const payloadFromStoreSignature: JwtBody = decode(downloadToken, true);

  if (payloadFromStoreSignature.serverDid !== serverDid) {
    throw new Error('serverDid mismatch');
  }

  if (payloadFromStoreSignature.blockletDid !== blockletDid) {
    throw new Error('blockletDid mismatch');
  }

  if (isEmpty(serverPublicKey)) {
    throw new Error('serverPublicKey must be provided');
  }

  if (!isFromPublicKey(serverDid, serverPublicKey)) {
    throw new Error('serverDid and serverPublicKey mismatch');
  }

  if (isEmpty(serverSignature)) {
    throw new Error('serverSignature must be provided');
  }

  if (!(await verify(serverSignature, serverPublicKey))) {
    throw new Error('serverSignature is invalid');
  }
}

export const isFreeBlocklet = (blocklet: { pricing: { paymentType: string } }) =>
  blocklet?.pricing?.paymentType === 'free';

/**
 * 根据 prices 的结构, 获取支付价格的 label
 */
export const parsePaymentPriceLabel = (pricing?: { price?: string; symbol?: string }) => {
  if (!pricing) {
    return '';
  }
  return `${pricing.price} ${pricing.symbol || 'ABT'}`;
};

// 处理历史的 price
export const parseOldPaymentPriceLabel = (list: { value?: number | string; symbol: string }[]) => {
  if (!list || !list.length) {
    return '';
  }
  const values = list.map((x) => `${x.value}`);
  return `${calcAdd(values)} ${list[0].symbol || 'ABT'}`;
};
