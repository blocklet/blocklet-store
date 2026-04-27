const payment = require('@blocklet/payment-js').default;
const { getUrl } = require('@blocklet/sdk/lib/component');
const logger = require('../../libs/logger');
const { IS_PAYMENT_LIVEMODE } = require('../../db/blocklet-pricing');

payment.environments.setLivemode(IS_PAYMENT_LIVEMODE);

const ensurePaymentWebhooks = async () => {
  const enabledEvents = ['checkout.session.completed'];
  const result = await payment.webhookEndpoints.list({ page: 1, size: 100 });
  if (result.list.length) {
    const webhook = await payment.webhookEndpoints.update(result.list[0].id, {
      url: getUrl('/api/payment/callback'),
      enabled_events: enabledEvents,
    });
    logger.info('webhooks updated', webhook);
    return;
  }

  const webhook = await payment.webhookEndpoints.create({
    url: getUrl('/api/payment/callback'),
    enabled_events: enabledEvents,
  });
  logger.info('webhooks created', webhook);
};

module.exports = ensurePaymentWebhooks;
