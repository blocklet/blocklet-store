const express = require('express');
const env = require('../../libs/env');

const router = express.Router();

router.use((req, res, next) => {
  if (env.preferences.allowPaidBlocklets) {
    return next();
  }

  return res.status(403).json({ error: 'Paid blocklets are not allowed in this store' });
});

router.post('/', require('./save'));

module.exports = router;
