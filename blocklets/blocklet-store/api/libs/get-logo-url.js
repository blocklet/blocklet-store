const formatLogoPath = ({ did, asset, version, size = 160, target = 'assets', updatedAt = '' }) => {
  const result = asset.startsWith(target) ? asset : `${target}/${did}/${asset}`;
  if (updatedAt) {
    return `${result}?imageFilter=resize&w=${size}&t=${updatedAt}`;
  }
  if (version) {
    return `${result}?imageFilter=resize&w=${size}&v=${version}`;
  }

  return `${result}?imageFilter=resize&w=${size}`;
};

const getLogoUrl = (meta, size = 180) => {
  let result = null;
  const { logo, did, version } = meta;
  const targetDir = 'assets';
  if (logo) {
    result = formatLogoPath({ did, logo, version, size, targetDir });
  }
  return result;
};

module.exports = getLogoUrl;
