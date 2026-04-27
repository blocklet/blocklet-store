import { describe, it, expect, beforeAll } from 'vitest';
import { fromSecretKey } from '@ocap/wallet';
import { sign } from '@arcblock/jwt';
import { verifyDownloadToken } from '../src/index';

const secretKey =
  '0xD67C071B6F51D2B61180B9B1AA9BE0DD0704619F0E30453AB4A592B036EDE644E4852B7091317E3622068E62A5127D1FB0D4AE2FC50213295E10652D2F0ABFC7';
const publicKey = '0xE4852B7091317E3622068E62A5127D1FB0D4AE2FC50213295E10652D2F0ABFC7';
const signer = 'zNKtCNqYWLYWYW3gWRA1vnRykfCBZYHZvzKr';
const wallet = fromSecretKey(secretKey);

describe('index.spec', () => {
  let verifyDownloadTokenParams: {
    blockletDid: string;
    downloadToken: string;
    storePublicKey: string;
    serverDid: string;
    serverPublicKey: string;
    serverSignature: string;
  };

  beforeAll(async () => {
    verifyDownloadTokenParams = {
      blockletDid: wallet.address,
      downloadToken: await sign(signer, secretKey, {
        serverDid: wallet.address,
        blockletDid: wallet.address,
      }),
      storePublicKey: publicKey,
      serverDid: wallet.address,
      serverPublicKey: publicKey,
      serverSignature: await sign(signer, secretKey),
    };
  });

  it('throw an error when downloadToken is empty', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        downloadToken: '',
      });
    }).rejects.toThrow(new Error('downloadToken must be provided'));
  });

  it('throw an error when downloadToken is invalid', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        downloadToken: 'error',
      });
    }).rejects.toThrow(new Error('downloadToken is invalid'));
  });

  it('throw an error when serverDid mismatch', async () => {
    const downloadToken = await sign(signer, secretKey, {
      serverDid: 'error',
    });

    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        downloadToken,
      });
    }).rejects.toThrow(new Error('serverDid mismatch'));
  });

  it('throw an error when blockletDid mismatch', async () => {
    const downloadToken = await sign(signer, secretKey, {
      serverDid: wallet.address,
      blockletDid: 'error',
    });

    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        downloadToken,
      });
    }).rejects.toThrow(new Error('blockletDid mismatch'));
  });

  it('throw an error when serverPublicKey is empty', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        serverPublicKey: '',
      });
    }).rejects.toThrow(new Error('serverPublicKey must be provided'));
  });

  it('throw an error when serverDid and serverPublicKey mismatch', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        serverPublicKey: 'error key',
      });
    }).rejects.toThrow(new Error('serverDid and serverPublicKey mismatch'));
  });

  it('throw an error when serverSignature is empty', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        serverSignature: '',
      });
    }).rejects.toThrow(new Error('serverSignature must be provided'));
  });

  it('throw an error when serverSignature is invalid', () => {
    expect(async () => {
      await verifyDownloadToken({
        ...verifyDownloadTokenParams,
        serverSignature: 'error signature',
      });
    }).rejects.toThrow(new Error('serverSignature is invalid'));
  });

  it('throw an error when serverSignature is invalid', async () => {
    const result = await verifyDownloadToken({
      ...verifyDownloadTokenParams,
    });

    expect(result).toBeUndefined();
  });
});
