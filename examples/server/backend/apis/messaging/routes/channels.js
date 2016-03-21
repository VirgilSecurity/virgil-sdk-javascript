'use strict';
var router = require('express').Router();
var controller = require('app-controller');
var channels = require('../../../modules/channels');

router.post('/channels/:channel_name/join', controller(channels.addMember));
router.get('/channels/:channel_name/members', controller(channels.getMembers));

module.exports = router;
