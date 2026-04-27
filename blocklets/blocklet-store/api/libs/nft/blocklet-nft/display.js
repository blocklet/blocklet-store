const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { joinURL } = require('ufo');
const { getNftBGColorFromDid, getSvg } = require('@arcblock/nft-display');
const env = require('../../env');

dayjs.extend(utc);

const formatDate = (date = new Date()) => {
  const utcOffset = dayjs(date).utcOffset();
  const format = dayjs(date).format('YYYY-MM-DD HH:mm');
  return `${format}(UTC+${utcOffset / 60})`;
};

const createPurchaseDisplay = ({ blocklet, asset } = {}) => {
  const { meta, did } = blocklet;

  return getSvg({
    color: getNftBGColorFromDid(asset.address),

    did: asset.address,
    variant: 'app-purchase',
    verifiable: true,
    chain: 'arcblock',

    // 这里展示的其实是买了什么，而不是谁颁发的
    issuer: {
      name: meta.title || meta.name,
      icon: joinURL(env.appUrl, 'assets', did, meta.logo),
    },

    extra: {
      key: 'Exp',
      value: formatDate(dayjs(asset.genesisTime).add(100, 'years').toDate()).slice(0, 11),
    },
  });
};

module.exports = {
  createPurchaseDisplay,
};
