// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock modules that have complex dependency chains (lodash submodule resolution issues)
vi.mock('@arcblock/did-connect-react/lib/utils', () => ({
  getWebWalletUrl: vi.fn(),
}));

vi.mock('@iconify/react', () => ({
  Icon: vi.fn(),
}));

vi.mock('@iconify-icons/tabler/coffee', () => ({
  default: {},
}));

import { getLaunchAddress, getUrlPrefix, getBlockletJsonUrl } from '../../src/libs/util';

describe('getUrlPrefix', () => {
  afterEach(() => {
    delete window.blocklet;
  });

  test('should return "/" when window.blocklet is undefined', () => {
    window.blocklet = undefined;
    const { prefix, apiPrefix } = getUrlPrefix();
    expect(prefix).toBe('/');
    expect(apiPrefix).toBe('');
  });

  test('should return "/" when window.blocklet.prefix is empty', () => {
    window.blocklet = { prefix: '' };
    const { prefix, apiPrefix } = getUrlPrefix();
    expect(prefix).toBe('/');
    expect(apiPrefix).toBe('');
  });

  test('should return the configured prefix', () => {
    window.blocklet = { prefix: '/store' };
    const { prefix, apiPrefix } = getUrlPrefix();
    expect(prefix).toBe('/store');
    expect(apiPrefix).toBe('/store');
  });

  test('should handle prefix with trailing slash', () => {
    window.blocklet = { prefix: '/store/' };
    const { prefix, apiPrefix } = getUrlPrefix();
    expect(prefix).toBe('/store/');
    expect(apiPrefix).toBe('/store');
  });
});

describe('getLaunchAddress', () => {
  const LAUNCHER_URL = 'https://launcher.example.com/launch-blocklet/agreement';
  const APP_URL = 'https://store.example.com';
  const DID = 'z8iZrkWYbi3JU3AP9NHJQbBUdrgiRGX2T68bmQ7V7';
  const LOCALE = 'en';

  beforeEach(() => {
    window.blocklet = {
      appUrl: APP_URL,
      prefix: '/',
      preferences: {
        launcherUrl: LAUNCHER_URL,
      },
    };
    localStorage.clear();
  });

  afterEach(() => {
    delete window.blocklet;
    localStorage.clear();
  });

  test('should return empty string when LAUNCH_URL is missing', () => {
    window.blocklet = { appUrl: APP_URL, prefix: '/', preferences: {} };
    const result = getLaunchAddress(DID, { search: '' }, LOCALE);
    expect(result).toBe('');
  });

  test('should return empty string when appUrl is missing', () => {
    window.blocklet = { prefix: '/', preferences: { launcherUrl: LAUNCHER_URL } };
    const result = getLaunchAddress(DID, { search: '' }, LOCALE);
    expect(result).toBe('');
  });

  test('should build correct metaUrl when mounted at root /', () => {
    const result = getLaunchAddress(DID, { search: '' }, LOCALE);
    const url = new URL(result);
    const metaUrl = url.searchParams.get('blocklet_meta_url');

    expect(metaUrl).toBe(`${APP_URL}/api/blocklets/${DID}/blocklet.json`);
    expect(url.searchParams.get('locale')).toBe(LOCALE);
  });

  test('should include prefix in metaUrl when mounted at non-root path', () => {
    window.blocklet.prefix = '/store';
    const result = getLaunchAddress(DID, { search: '' }, LOCALE);
    const url = new URL(result);
    const metaUrl = url.searchParams.get('blocklet_meta_url');

    expect(metaUrl).toBe(`${APP_URL}/store/api/blocklets/${DID}/blocklet.json`);
  });

  test('should include version in metaUrl when provided', () => {
    window.blocklet.prefix = '/store';
    const version = '1.2.3';
    const result = getLaunchAddress(DID, { search: '' }, LOCALE, version);
    const url = new URL(result);
    const metaUrl = url.searchParams.get('blocklet_meta_url');

    expect(metaUrl).toBe(`${APP_URL}/store/api/blocklets/${DID}/${version}/blocklet.json`);
  });

  test('should use server-url from query when provided', () => {
    const serverUrl = 'https://my-server.example.com';
    const result = getLaunchAddress(DID, { search: `?server-url=${encodeURIComponent(serverUrl)}` }, LOCALE);
    const url = new URL(result);

    expect(url.origin).toBe(serverUrl);
    expect(url.pathname).toBe('/launch-blocklet/agreement');
  });

  test('should fallback to launcherUrl when server-url is invalid', () => {
    const result = getLaunchAddress(DID, { search: '?server-url=not-a-valid-url' }, LOCALE);
    expect(result).toContain(LAUNCHER_URL);
  });

  test('should prefer localStorage launcherUrl over preferences', () => {
    const localLauncherUrl = 'https://local-launcher.example.com/launch-blocklet/agreement';
    localStorage.setItem('launcherUrl', localLauncherUrl);

    const result = getLaunchAddress(DID, { search: '' }, LOCALE);
    const url = new URL(result);

    expect(url.origin).toBe('https://local-launcher.example.com');
  });
});

describe('getBlockletJsonUrl', () => {
  afterEach(() => {
    delete window.blocklet;
  });

  test('should build correct URL with root prefix', () => {
    window.blocklet = { prefix: '/' };
    const did = 'z8iZrkWYbi3JU3AP9NHJQbBUdrgiRGX2T68bmQ7V7';
    const result = getBlockletJsonUrl(did);

    expect(result).toBe(`${window.location.origin}/api/blocklets/${did}/blocklet.json`);
  });

  test('should include prefix in URL when mounted at non-root path', () => {
    window.blocklet = { prefix: '/store' };
    const did = 'z8iZrkWYbi3JU3AP9NHJQbBUdrgiRGX2T68bmQ7V7';
    const result = getBlockletJsonUrl(did);

    expect(result).toBe(`${window.location.origin}/store/api/blocklets/${did}/blocklet.json`);
  });

  test('should include version when provided', () => {
    window.blocklet = { prefix: '/store' };
    const did = 'z8iZrkWYbi3JU3AP9NHJQbBUdrgiRGX2T68bmQ7V7';
    const result = getBlockletJsonUrl(did, '1.0.0');

    expect(result).toBe(`${window.location.origin}/store/api/blocklets/${did}/1.0.0/blocklet.json`);
  });
});
