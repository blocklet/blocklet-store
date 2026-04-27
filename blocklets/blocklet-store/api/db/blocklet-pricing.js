const { calcPercent } = require('@blocklet/util');
const { PAYMENT_TYPE } = require('../libs/constant');
const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

const IS_PAYMENT_LIVEMODE = process.env.PAYMENT_LIVEMODE === 'true';
const SYMBOL = process.env.PAYMENT_LIVEMODE === 'false' ? 'TBA' : 'ABT';

/**
 * @typedef {{
 *  paymentType: string,
 *  blockletId: string,
 *  productId: string,
 *  price: string,
 *  priceId: string,
 *  linkId: string,
 *  linkUrl: string,
 *
 */
class BlockletPricing extends BaseDB {
  constructor() {
    super(DB_NAME.BLOCKLET_PRICING);
    this.ensureIndex({ fieldName: 'blockletId', unique: true }, (err) => {
      if (err) {
        console.error('Failed to ensure appId unique index', err);
      }
    });
  }

  exist = async (blockletId) => {
    const item = await this.findOne({ blockletId });
    return !!item;
  };

  findListByBlockletId = (...idList) => {
    const filteredIdList = idList.filter(Boolean);
    if (filteredIdList.length === 0) {
      return [];
    }
    return this.find({ blockletId: { $in: filteredIdList } });
  };

  parsePricing = (pricing) => {
    if (!pricing) {
      return undefined;
    }
    return {
      pricingId: pricing.id,
      productId: pricing.productId,
      paymentType: pricing.paymentType,
      priceId: pricing.priceId,
      price: pricing.price,
      linkId: pricing.linkId,
    };
  };

  parsePayment = (pricing) => {
    if (!pricing) {
      return {
        price: [],
        share: [],
      };
    }
    const { price, paymentType, beneficiaries } = pricing;
    if (paymentType === PAYMENT_TYPE.PAID_ONE_TIME) {
      return {
        price: beneficiaries.map((v) => ({
          value: Number(calcPercent(price, v.share, '10')),
          address: v.address,
          symbol: SYMBOL,
        })),
        share: [],
      };
    }
    return {
      price: [],
      share: [],
    };
  };

  assignMeta = (meta, pricing) => {
    if (!meta) {
      return;
    }
    meta.pricing = this.parsePricing(pricing);
    meta.payment = this.parsePayment(pricing);
  };
}

module.exports = new BlockletPricing();
module.exports.IS_PAYMENT_LIVEMODE = IS_PAYMENT_LIVEMODE;
module.exports.SYMBOL = SYMBOL;
