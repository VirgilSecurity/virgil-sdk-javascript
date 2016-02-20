var Promise = require('bluebird');
var assert = require('assert');

assert(process.env.VIRGIL_MAILINATOR_TOKEN, 'env.VIRGIL_MAILINATOR_TOKEN is required');

module.exports = Promise.promisifyAll(
	require('mailinator')({ token: process.env.VIRGIL_MAILINATOR_TOKEN })
);
