const payment = require('@blocklet/payment-js').default;
const env = require('../../../libs/env');

async function createPaymentLink({ name, blockletDid, paymentPrice }) {
  // FIXME: @pillar 这里需要未来补充子组件的分成比例
  const beneficiaries = [
    {
      address: env.appId,
      share: '3',
    },
    {
      address: blockletDid,
      share: '7',
    },
  ];
  const link = await payment.paymentLinks.create({
    name,
    currency_id: paymentPrice.currency_id,
    line_items: [
      {
        price_id: paymentPrice.id,
        quantity: 1,
      },
    ],
    payment_intent_data: {
      beneficiaries,
    },
  });

  return { link, beneficiaries };
}

module.exports = createPaymentLink;
