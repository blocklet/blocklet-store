import semver from 'semver';
import { parseFilename, parseQuery, parseURL, stringifyParsedURL, withQuery } from 'ufo';

export function getUrlPrefix() {
  const prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }

  return { apiPrefix, prefix };
}

export const displayAttributes = ({ blocklet, attribute, value }: any) => {
  if (blocklet._formatted) {
    return blocklet._formatted[attribute];
  }
  return value;
};

export const formatImagePath = (
  asset: string,
  size: number | { w: number; h: number },
  version: string,
  publishedAt = '',
) => {
  const urlInfo = parseURL(asset);
  const query = parseQuery(urlInfo.search);
  const isGif = parseFilename(asset, { strict: true })?.endsWith('.gif');

  // 如果 gif 图片，则不添加 imageFilter bug: https://github.com/ArcBlock/blocklet-server/issues/9969
  if (isGif) {
    return query.imageFilter ? stringifyParsedURL({ ...urlInfo, search: '' }) : asset;
  }

  if (query.imageFilter) {
    return asset;
  }

  const v = version || window.blocklet?.version;
  const { w, h } = typeof size === 'number' ? { w: size, h: size } : { w: size.w, h: size.h };
  return withQuery(asset, {
    ...(w || h ? { imageFilter: 'resize', w, h } : {}),
    v,
    ...(publishedAt ? { t: publishedAt } : {}),
  });
};

/**
 *
 * @param {string} did 当前 blocklet 的 did
 * @param {string} asset 文件路径
 * @param {string} version 当前 blocklet 的版本号
 * @param {number} [size=80] 需要裁剪的目标尺寸
 * @param {string} [target=asset] 文件路径前缀
 * @returns
 */
export const formatLogoPath = (params: {
  did: string;
  asset: string;
  version: string;
  size?: number;
  target?: string;
  publishedAt?: string;
}) => {
  const { did, asset, version, size = 160, target = 'assets', publishedAt = '' } = params;
  const result = asset.startsWith(target) ? asset : `${target}/${did}/${asset}`;
  return formatImagePath(result, size, version, publishedAt);
};

type BlockletItem = {
  did: string;
  version: string;
};

type ComponentMountPoint = {
  did: string;
  version: string;
};

export const getCurrentVersion = (blockletItem: BlockletItem) => {
  const componentMountPoints: ComponentMountPoint[] = window.blocklet?.componentMountPoints || [];
  const exist = componentMountPoints.find((x) => x.did === blockletItem.did);
  const currentVersion = exist?.version;
  return currentVersion;
};

export const getInstallOrUpgrade = (blockletItem: BlockletItem) => {
  const componentMountPoints: ComponentMountPoint[] = window.blocklet?.componentMountPoints || [];
  const exist = componentMountPoints.find((x) => x.did === blockletItem.did);
  if (exist) {
    try {
      const currentVersion = exist.version;
      const targetVersion = blockletItem.version;
      if (semver.gt(targetVersion, currentVersion)) {
        return 'upgrade';
      }
    } catch {
      // 如果比对版本报错，则还是允许安装
      return 'install';
    }
    return 'installed';
  }
  return 'install';
};
