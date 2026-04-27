import { describe, test, expect } from 'vitest';
import { getEditLocales, diffLocales, getExtraLocales, getDisplayLocale } from '../../src/libs/category';

const locales = { zh: '新闻', en: 'News 1', ko: '한국어' };
const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
  },
];

describe('test getEditLocales', () => {
  test('throws on Arguments locales is not an object ', () => {
    expect(() => getEditLocales('Invalid arguments', [])).toThrow();
  });
  test('throws on Arguments languages is not an array ', () => {
    expect(() => getEditLocales({}, 'Invalid arguments')).toThrow();
  });
  test('should work as expected', () => {
    expect(getEditLocales(locales, languages)).toEqual({ zh: '新闻', en: 'News 1' });
  });
});

describe('diffLocales', () => {
  test('throws on Arguments locales is not an object ', () => {
    expect(() => diffLocales('Invalid arguments', [])).toThrow();
  });
  test('throws on Arguments languages is not an array ', () => {
    expect(() => diffLocales({}, 'Invalid arguments')).toThrow();
  });
  test('should work as expected', () => {
    expect(diffLocales(locales, languages)).toEqual(false);
    expect(diffLocales({ jp: '日文' }, languages)).toEqual(true);
  });
});

describe('getExtraLocales', () => {
  test('throws on Arguments locales is not an object ', () => {
    expect(() => getExtraLocales('Invalid arguments', [])).toThrow();
  });
  test('throws on Arguments languages is not an array ', () => {
    expect(() => getExtraLocales({}, 'Invalid arguments')).toThrow();
  });
  test('should work as expected', () => {
    expect(getExtraLocales({ zh: '新闻', en: 'News 1' }, languages)).toEqual({});
    expect(getExtraLocales({ jp: '日文' }, languages)).toEqual({ jp: '日文' });
  });
});

describe('getDisplayLocale', () => {
  test('throws on Arguments locales is not an object ', () => {
    expect(() => getDisplayLocale('Invalid arguments')).toThrow();
  });
  test('should work as expected', () => {
    expect(getDisplayLocale({ zh: '新闻' })).toEqual('新闻-Chinese');
    expect(getDisplayLocale({ ja: '日文' })).toEqual('日文-Japanese');
  });
});
