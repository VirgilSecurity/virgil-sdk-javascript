'use strict';
var router = require('express').Router();

router.use(require('./channels'));
router.use(require('./messages'));

module.exports = router;
