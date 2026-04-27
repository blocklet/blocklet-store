const payment = require('@blocklet/payment-js').default;
const blockletPricing = require('../../../db/blocklet-pricing');
const createPaymentLink = require('./create-payment-link');
const logger = require('../../../libs/logger');
const { event, Events } = require('../../../events');
const { PAYMENT_TYPE } = require('../../../libs/constant');
const getLogoUrl = require('../../../libs/get-logo-url');

async function create({ blocklet, price, paymentType }) {
  // FIXME: @pillar 这里需要未来补充子, 如果子组件有价格, 但是这个商品是免费的逻辑
  if (paymentType === PAYMENT_TYPE.FREE) {
    throw new Error('Free pricing is not created here');
  }
  if (!Number(price) || Number(price) <= 0) {
    throw new Error('Price must be greater than 0');
  }

  const product = await payment.products.create({
    name: blocklet.meta.title,
    images: [getLogoUrl(blocklet.meta)],
    description: blocklet.meta.description,
  });

  // FIXME: @pillar 这里需要未来补充子, 子组件的总价
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
  const pricing = {
    blockletId: blocklet._id,
    paymentType,
    price,
    productId: product.id,
    priceId: paymentPrice.id,
    linkId: link.id,
    beneficiaries,
    symbol: blockletPricing.SYMBOL,
  };

  await blockletPricing.insert(pricing);
  event.emit(Events.BLOCKLET_PRICING_CHANGED, {
    blockletId: blocklet._id,
  });
  logger.info('update blocklet pricing', { id: blocklet._id, price, paymentType });
}

module.exports = create;
