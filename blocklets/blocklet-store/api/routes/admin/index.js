const router = require('express').Router();

router.use('/blocklets', require('./blocklet'));
router.use('/categories', require('./category'));

module.exports = router;
