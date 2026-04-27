const { removeTrailingZeros } = require('@blocklet/util');
const blockletDb = require('../../db/blocklet');
const blockletPricing = require('../../db/blocklet-pricing');
const { PAYMENT_TYPE } = require('../../libs/constant');
const create = require('./services/create');
const update = require('./services/update');
const logger = require('../../libs/logger');

const paymentTypes = { [PAYMENT_TYPE.FREE]: true, [PAYMENT_TYPE.PAID_ONE_TIME]: true };
async function save(req, res) {
  const { blockletId, price, paymentType } = req.body;
  if (!blockletId) {
    return res.status(400).json({ error: 'Blocklet DID is required when updating pricing' });
  }
  if (typeof price !== 'string' || Number.isNaN(Number(price))) {
    return res.status(400).json({ error: 'Blocklet price must be a number' });
  }
  if (!paymentTypes[paymentType]) {
    return res.status(400).json({ error: 'Blocklet payment type must be free or paid-one-time' });
  }
  const blocklet = await blockletDb.findOne({ _id: blockletId });
  if (!blocklet) {
    return res.status(400).json({ error: 'No found Blocklet data by blockletId' });
  }
  const parsedPrice = removeTrailingZeros(price);

  const isExist = await blockletPricing.exist(blockletId);
  try {
    if (isExist) {
      await update({ blocklet, price: parsedPrice, paymentType });
    } else {
      await create({ blocklet, price: parsedPrice, paymentType });
    }
  } catch (err) {
    logger.error(err, req.originalUrl, 500, req.headers['x-real-ip']);
    return res.status(500).json({ error: err.message });
  }
  return res.json({ success: true });
}

module.exports = save;
