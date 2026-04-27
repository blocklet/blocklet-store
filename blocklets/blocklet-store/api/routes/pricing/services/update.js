const payment = require('@blocklet/payment-js').default;
const blockletPricing = require('../../../db/blocklet-pricing');
const createPaymentLink = require('./create-payment-link');
const logger = require('../../../libs/logger');
const { event, Events } = require('../../../events');
const { PAYMENT_TYPE } = require('../../../libs/constant');
const getLogoUrl = require('../../../libs/get-logo-url');

async function update({ blocklet, price, paymentType }) {
  if (paymentType === PAYMENT_TYPE.FREE) {
    await blockletPricing.update({ blockletId: blocklet._id }, { $set: { paymentType } });
    logger.info('update blocklet pricing', { id: blocklet._id, price, paymentType });
    event.emit(Events.BLOCKLET_PRICING_CHANGED, {
      blockletId: blocklet._id,
    });
    return;
  }
  const pricing = await blockletPricing.findOne({ blockletId: blocklet._id });
  if (!pricing) {
    throw new Error('No pricing found by blockletId');
  }
  if (!Number(price) || Number(price) <= 0) {
    throw new Error('Price must be greater than 0');
  }

  // 确保 product 存在
  const product = await payment.products.retrieve(pricing.productId);

  payment.products.update(product.id, {
    name: blocklet.meta.title,
    images: [getLogoUrl(blocklet.meta)],
    description: blocklet.meta.description,
  });

  // 如果曾经创建过相同价格，直接使用历史 price 对象
  const paymentPrice = await payment.prices.create({
    product_id: product.id,
    type: 'one_time',
    unit_amount: price,
    model: 'standard',
  });

  const { link, beneficiaries } = await createPaymentLink({
    name: blocklet.meta.title,
    blockletDid: blocklet.meta.id,
    paymentPrice,
  });
  const nextPricing = {
    blockletId: blocklet._id,
    productId: product.id,
    paymentType,
    price,
    priceId: paymentPrice.id,
    linkId: link.id,
    beneficiaries,
    symbol: blockletPricing.SYMBOL,
  };
  await blockletPricing.update(
    { blockletId: blocklet._id },
    {
      $set: nextPricing,
    }
  );
  event.emit(Events.BLOCKLET_PRICING_CHANGED, {
    blockletId: blocklet._id,
  });
  logger.info('update blocklet pricing', { id: blocklet._id, price, paymentType });
}

module.exports = update;
