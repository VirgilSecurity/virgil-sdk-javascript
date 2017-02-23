'use strict';

var utils = require('../shared/utils');
var cardsErrors = require('./cards-errors');

module.exports = utils.assign({}, cardsErrors, {
	'10000': 'Internal application error',
	'30300': 'Development Portal sign was not found inside the meta.signs property',
	'30301': 'Development Portal sign is invalid',
	'30302': 'Identity Validation Token is invalid or has expired',
	'30303': 'Provided Virgil Card was not found or invalid',
	'50010': 'Requested route was not found'
});
