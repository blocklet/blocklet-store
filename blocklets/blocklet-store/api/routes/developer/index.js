const router = require('express').Router();

router.use('/blocklets', require('./blocklet'));
router.use('/access-tokens', require('./access-token'));

module.exports = router;
