import { describe, test, expect, it } from 'vitest';

const path = require('path');

process.env.CHAIN_HOST = 'https://main.abtnetwork.io/api/';
process.env.BLOCKLET_DATA_DIR = '/tmp/blocklets/blocklet-store/test-dir';
process.env.BLOCKLET_LOG_DIR = '/tmp/blocklets/blocklet-store/test-log';

const { getFormattedChangelog, getChangeLogUpdates } = require('../../../api/libs/change-log');

describe('#getFormattedChangelog', () => {
  test('throw an error when changeLogFilePath is undefined', () => {
    expect(() => getFormattedChangelog()).toThrow('changeLogFilePath argument is required');
  });
  test('result empty array when not found CHANGELOG.md', () => {
    const result = [];
    expect(getFormattedChangelog(path.join(__dirname, './CHANGELOG.md'))).toEqual(result);
  });
  test('throw an error when incorrect file', () => {
    expect(() => getFormattedChangelog(path.join(__dirname, './assets/blocklet/incorrect.md'))).toThrow(
      'incorrect file name, The desired file name is CHANGELOG.md'
    );
  });
  test('throw an error when CHANGELOG.md is empty', () => {
    expect(() => getFormattedChangelog(path.join(__dirname, './assets/blocklet/empty/CHANGELOG.md'))).toThrow(
      'CHANGELOG.md file is empty'
    );
  });
  test('successfully when the function execution result is expected', () => {
    const result = [
      {
        title: '0.3.59',
        body:
          '<h3>New feature:</h3>\n' +
          '<ul>\n' +
          '<li>redirect to &quot;Install on AbtNode&quot; when click &quot;Launch&quot;</li>\n' +
          '</ul>\n' +
          '<h3>Bugs fixed:</h3>\n' +
          '<ul>\n' +
          '<li>wrap prettyPrice inside try-catch to make api</li>\n' +
          '</ul>\n',
      },
      {
        title: '0.3.58',
        body:
          '<h3>Bugs fixed:</h3>\n' +
          '<ul>\n' +
          '<li>version</li>\n' +
          '<li>do not block start when can not connect to chain</li>\n' +
          '</ul>\n',
      },
      { title: '0.3.53', body: '' },
    ];
    expect(getFormattedChangelog(path.join(__dirname, './assets/blocklet/CHANGELOG.md'))).toEqual(result);
  });
});

describe('getChangeLogUpdates', () => {
  it('should handle basic match scenario', () => {
    const changeLogs = [
      { title: '1.0.1', body: 'Bug fixes.' },
      { title: '1.0.0', body: 'Initial release.' },
    ];
    const versions = [{ version: '1.0.1' }, { version: '1.0.0' }];
    const expected = [
      { version: '1.0.1', changeLog: 'Bug fixes.' },
      { version: '1.0.0', changeLog: 'Initial release.' },
    ];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });

  it('should ignore changelogs', () => {
    const changeLogs = [
      { title: '1.0.1', body: 'Bug fixes.' },
      { title: '1.0.0', body: 'Initial release.' },
    ];
    const versions = [{ version: '1.0.0' }];
    const expected = [{ version: '1.0.0', changeLog: 'Initial release.' }];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });

  it('should merge changelogs for versions not in versions but have a greater version in versions #1', () => {
    const changeLogs = [
      { title: '1.0.2', body: 'Minor tweaks.' },
      { title: '1.0.1', body: 'Bug fixes.' },
    ];
    const versions = [{ version: '1.0.2' }];
    const expected = [{ version: '1.0.2', changeLog: 'Minor tweaks.Bug fixes.' }];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });

  it('should merge changelogs for versions not in versions but have a greater version in versions #2', () => {
    const changeLogs = [
      { title: '1.0.3', body: 'Major tweaks.' },
      { title: '1.0.2', body: 'Minor tweaks.' },
      { title: '1.0.1', body: 'Bug fixes.' },
      { title: '1.0.0', body: '' },
    ];
    const versions = [{ version: '1.0.3' }, { version: '1.0.1' }];
    const expected = [
      { version: '1.0.3', changeLog: 'Major tweaks.Minor tweaks.' },
      { version: '1.0.1', changeLog: 'Bug fixes.' },
    ];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });

  it('should handle empty changeLogs array', () => {
    const changeLogs = [];
    const versions = [{ version: '1.0.1' }];
    const expected = [];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });

  it('should correctly handle versions not found in either array', () => {
    const changeLogs = [{ title: '1.0.2', body: 'Minor tweaks.' }];
    const versions = [{ version: '1.0.0' }];
    const expected = [];
    expect(getChangeLogUpdates(changeLogs, versions)).toEqual(expected);
  });
});
