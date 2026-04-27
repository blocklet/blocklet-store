const payment = require('@blocklet/payment-js').default;
const { joinURL } = require('ufo');
const logger = require('../../libs/logger');
const blockletPricing = require('../../db/blocklet-pricing');
const blockletDb = require('../../db/blocklet');
const { mintBlockletNFT } = require('../../libs/nft/blocklet-nft/mint-blocklet-nft');
const env = require('../../libs/env');
const { sendMintNFTNotification } = require('../../libs/notification');

const handlePurchased = async (req, res) => {
  const checkoutSessionId = req.body.object_id;
  const { metadata } = req.body;

  if (!checkoutSessionId) {
    res.status(400).json({ message: 'Invalid Request' });
    return;
  }

  const checkoutSession = await payment.checkout.sessions.retrieve(checkoutSessionId);
  if (!checkoutSession) {
    res.status(400).json({ message: 'Invalid checkout session' });
    return;
  }

  if (checkoutSession.status !== 'complete') {
    res.status(400).json({ message: 'Checkout session not complete' });
    return;
  }

  const priceId = req.body.data.object?.line_items?.[0]?.price_id;
  if (!priceId) {
    logger.error('no price id found');
    res.status(400).json({ message: 'no price id found' });
    return;
  }

  const pricing = await blockletPricing.findOne({ priceId });
  if (!pricing) {
    logger.error('no pricing found for product', { priceId });
    res.status(400).json({ message: 'no pricing found for product' });
    return;
  }
  const blocklet = await blockletDb.findOne({ _id: pricing.blockletId });
  if (!blocklet) {
    logger.error('no blocklet found for pricing', { pricing });
    res.status(400).json({ message: 'no blocklet found for pricing' });
    return;
  }

  const ownerDid = checkoutSession.customer_did;

  const { hash, address: nftDid } = await mintBlockletNFT({
    ownerDid,
    blockletDid: blocklet.meta?.did,
    name: blocklet.meta?.title,
    url: joinURL(env.appUrl, 'blocklets', blocklet.meta?.did),
  });

  if (!hash || !nftDid) {
    logger.error('mint nft failed', { ownerDid, blockletId: blocklet._id });
    res.status(400).json({ message: 'mint nft failed' });
    return;
  }

  const message = { chainHost: env.chainHost, nftDid, to: ownerDid };

  sendMintNFTNotification(message)
    .then(() => logger.info('send mint nft notification success', message))
    .catch((err) => {
      logger.error('send mint nft notification failed', { err, ...message });
    });

  logger.info('minted nft', {
    sessionId: checkoutSession.id,
    hash,
    nftDid,
    userDid: checkoutSession.customer_did,
  });

  const checkoutSessionUpdated = await payment.checkout.sessions.update({
    id: checkoutSessionId,
    metadata: {
      ...metadata,
      nft_did: nftDid,
    },
  });
  if (!checkoutSessionUpdated) {
    res.status(400).json({ message: 'Invalid checkout session' });
    return;
  }

  res.json({ message: 'success' });
};

const webhookTypes = {
  'checkout.session.completed': handlePurchased,
};

const handleWebhooks = async (req, res) => {
  try {
    const { body } = req;
    const { type } = req.body;

    logger.info('subscription updated', {
      eventId: body.id,
      objectId: body.data.object.id,
      type,
    });

    const hook = webhookTypes[type];
    if (hook) {
      await hook(req, res);
      return;
    }

    res.json({ message: 'success' });
  } catch (error) {
    logger.error('handle webhook error', { error, body: JSON.stringify(req.body, null, 2) });
  }
};

module.exports = handleWebhooks;
