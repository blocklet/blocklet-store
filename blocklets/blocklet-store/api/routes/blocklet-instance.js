const express = require('express');
const BlockletInstance = require('../db/blocklet-instance');
const verifyInstance = require('../middlewares/verify-blocklet-instance');

const logger = require('../libs/logger');

const router = express.Router();

router.get('/:appId', async (req, res) => {
  const { appId } = req.params;
  const result = await BlockletInstance.findOne({ appId });
  return res.json(result);
});

router.put('/:appId', verifyInstance, async (req, res) => {
  const { blockletDid, ownerDid, appUrl } = req.body;
  const { appId } = req.params;
  const isAppIdExist = await BlockletInstance.isAppIdExist(appId);
  let result = null;
  try {
    if (isAppIdExist) {
      result = await BlockletInstance.update({ appId }, { $set: { blockletDid, ownerDid, appUrl } });
    } else {
      result = await BlockletInstance.insert({ appId, blockletDid, ownerDid, appUrl });
    }
  } catch (error) {
    logger.error(error, req.originalUrl, 500, req.headers['x-real-ip']);
    return res.status(500).json({ error: error.message });
  }
  return res.json(result);
});

router.delete('/:appId', verifyInstance, async (req, res) => {
  const { appId } = req.params;
  const result = await BlockletInstance.remove({ appId });
  return res.json(result);
});

module.exports = router;
