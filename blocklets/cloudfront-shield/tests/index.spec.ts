import { Context } from 'aws-lambda';
import cloneDeep from 'lodash-es/cloneDeep';
import { verifyDownloadToken } from '@blocklet/util';
import axios from 'axios';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { handler } from '../src';
import { ViewRequestEvent } from '../src/types';

vi.mock('axios');
const axiosMock = axios as any;
vi.mock('@blocklet/util');
const verifyDownloadTokenMock = verifyDownloadToken as any;

describe('index.spec', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const viewRequestEvent: ViewRequestEvent = Object.freeze({
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: 'dm139eo9o82m8.cloudfront.net',
            distributionId: 'E30IY1WHEZ5FHV',
            eventType: 'viewer-request',
            requestId: 'Cwf6_cfe3rhNKgoFkW44bIjFFTR-IuiXpo3CuTP14q1iyA6j1AZB9Q==',
          },
          request: {
            body: {
              action: 'read-only',
              data: '',
              encoding: 'base64',
              inputTruncated: false,
            },
            clientIp: '112.118.10.179',
            headers: {
              host: [
                {
                  key: 'Host',
                  value: 'store.blocklet.dev/',
                },
              ],
              'user-agent': [
                {
                  key: 'User-Agent',
                  value: 'PostmanRuntime/7.29.0',
                },
              ],
              'x-download-token': [
                {
                  key: 'x-download-token',
                  value: 'x-download-token',
                },
              ],
              'x-store-public-key': [
                {
                  key: 'x-store-public-key',
                  value: 'x-store-public-key',
                },
              ],
              'x-server-did': [
                {
                  key: 'x-server-did',
                  value: 'x-server-did',
                },
              ],
              'x-server-public-key': [
                {
                  key: 'x-server-public-key',
                  value: 'x-server-public-key',
                },
              ],
              'x-server-signature': [
                {
                  key: 'x-server-signature',
                  value: 'x-server-signature',
                },
              ],
              accept: [
                {
                  key: 'Accept',
                  value: '*/*',
                },
              ],
              'cache-control': [
                {
                  key: 'Cache-Control',
                  value: 'no-cache',
                },
              ],
              'postman-token': [
                {
                  key: 'Postman-Token',
                  value: '1c3bafac-51f6-4656-a0c9-8e9f939cf397',
                },
              ],
              'accept-encoding': [
                {
                  key: 'Accept-Encoding',
                  value: 'gzip, deflate, br',
                },
              ],
            },
            method: 'GET',
            origin: {
              custom: {
                customHeaders: {
                  'x-store-public-key': [
                    {
                      key: 'X-STORE-PUBLIC-KEY',
                      value: 'z8VahoQa6oS63Ym3rfsmzZEt9Moonbg4JSUiit5J7DRAV',
                    },
                  ],
                },
                domainName: 'test.domain.name',
                keepaliveTimeout: 5,
                path: '',
                port: 443,
                protocol: 'https',
                readTimeout: 30,
                sslProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
              },
            },
            querystring: '',
            uri: '/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/express-test-for-pc-0.1.29.tgz',
          },
        },
      },
    ],
  });

  const context: Context = {} as Context;

  const callback = vi.fn();

  it('should be work when the uri is not a blocklet tgz link', async () => {
    const isNotABlockletUris = [
      '/',
      '/api/blocklets/',
      '/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/hello',
      '/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/blocklet.json',
    ];

    for (const uri of isNotABlockletUris) {
      const event = cloneDeep(viewRequestEvent);
      event.Records[0].cf.request.uri = uri;
      // eslint-disable-next-line no-await-in-loop
      await handler(event, context, callback);

      expect(callback).toBeCalledWith(null, event.Records[0].cf.request);
    }
  });

  it('should be work when blocklet is free', async () => {
    const event = cloneDeep(viewRequestEvent);

    axiosMock.get.mockResolvedValueOnce({
      data: {
        payment: {
          price: [],
          share: [],
        },
      },
    });

    axiosMock.get.mockResolvedValueOnce({
      data: {
        pk: 'z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV',
      },
    });

    verifyDownloadTokenMock.mockRejectedValue(new Error('downloadToken is invalid'));

    await handler(event, context, callback);

    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://${event.Records[0].cf.request.headers.host[0].value}/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/blocklet.json`
    );
    expect(callback).toBeCalledWith(null, event.Records[0].cf.request);
  });

  it('should be work when blocklet is free and has specific version', async () => {
    const event = cloneDeep(viewRequestEvent);
    // https://store.blocklet.dev/api/blocklets/z2qaJ15dimH9d9SWJRWWJbQEHsmDVhRbQzrT9/z2qaJ15dimH9d9SWJRWWJbQEHsmDVhRbQzrT9-1.0.5.tgz
    event.Records[0].cf.request.uri =
      '/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/0.1.29/express-test-for-pc-0.1.29.tgz';

    axiosMock.get.mockResolvedValueOnce({
      data: {
        payment: {
          price: [],
          share: [],
        },
      },
    });

    await handler(event, context, callback);

    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://${event.Records[0].cf.request.headers.host[0].value}/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/0.1.29/blocklet.json`
    );
  });

  it('should be work when blocklet is paid and unauthorized', async () => {
    const event = cloneDeep(viewRequestEvent);
    event.Records[0].cf.request.origin.custom.customHeaders['x-store-public-key'][0].value = 'storePublicKey from env';

    axiosMock.get.mockResolvedValueOnce({
      data: {
        payment: {
          price: [
            {
              address: 'abc',
              value: 1,
            },
          ],
          share: [],
        },
      },
    });

    verifyDownloadTokenMock.mockRejectedValue(new Error('downloadToken is invalid'));

    await handler(event, context, callback);

    expect(axiosMock.get).toHaveBeenLastCalledWith(
      `https://${event.Records[0].cf.request.headers.host[0].value}/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/blocklet.json`
    );
    expect(verifyDownloadTokenMock).toBeCalledWith({
      blockletDid: 'z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV',
      downloadToken: 'x-download-token',
      serverDid: 'x-server-did',
      serverPublicKey: 'x-server-public-key',
      serverSignature: 'x-server-signature',
      storePublicKey: 'storePublicKey from env',
    });

    expect(callback).toBeCalledWith(null, {
      status: 400,
      body: 'downloadToken is invalid',
    });
  });

  it('should be work when blocklet is paid and unauthorized', async () => {
    const event = cloneDeep(viewRequestEvent);

    axiosMock.get.mockResolvedValueOnce({
      data: {
        payment: {
          price: [
            {
              address: 'abc',
              value: 1,
            },
          ],
          share: [],
        },
      },
    });

    verifyDownloadTokenMock.mockRejectedValue(new Error('downloadToken is invalid'));

    await handler(event, context, callback);

    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://${event.Records[0].cf.request.headers.host[0].value}/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/blocklet.json`
    );
    expect(callback).toBeCalledWith(null, {
      status: 400,
      body: 'downloadToken is invalid',
    });
  });

  it('should be work when blocklet is paid and authorized', async () => {
    const event = cloneDeep(viewRequestEvent);

    axiosMock.get.mockResolvedValueOnce({
      data: {
        payment: {
          price: [
            {
              address: 'abc',
              value: 1,
            },
          ],
          share: [],
        },
      },
    });

    verifyDownloadTokenMock.mockResolvedValue();

    await handler(event, context, callback);

    expect(verifyDownloadTokenMock).toHaveBeenCalledWith({
      blockletDid: 'z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV',
      downloadToken: 'x-download-token',
      serverDid: 'x-server-did',
      serverPublicKey: 'x-server-public-key',
      serverSignature: 'x-server-signature',
      storePublicKey: 'z8VahoQa6oS63Ym3rfsmzZEt9Moonbg4JSUiit5J7DRAV',
    });

    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://${event.Records[0].cf.request.headers.host[0].value}/api/blocklets/z8ia4e5vAeDsQEE2P26bQqz9oWR1Lxg9qUMaV/blocklet.json`
    );

    expect(callback).toBeCalledWith(null, event.Records[0].cf.request);
  });

  it('should response error if x-store-public-key custom header was not set', async () => {
    const event = cloneDeep(viewRequestEvent);
    delete event.Records[0].cf.request.origin.custom.customHeaders['x-store-public-key'];

    await handler(event, context, callback);

    expect(callback).toBeCalledWith(null, {
      status: 400,
      body: 'x-store-public-key must be set',
    });
  });
});
