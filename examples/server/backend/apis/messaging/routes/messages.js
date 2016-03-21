'use strict';
var router = require('express').Router();
var controller = require('app-controller');
var messages = require('../../../modules/messages');

router.post('/channels/:channel_name/messages', controller(create));
router.get('/channels/:channel_name/messages', controller(messages.queryByChannel));

function create (params, req) {
	params.token = req.headers['x-identity-token'];
	return messages.create(params);
}

module.exports = router;
