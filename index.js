var VirgilCrypto = require('virgil-crypto');
var createVirgilCardsApi = require('./src/virgil-cards');
var createPublicKeysApi = require('./src/public-keys');
var createPrivateKeysApi = require('./src/private-keys');
var createIdentityApi = require('./src/identity');

function VirgilSDK (applicationToken, opts) {
	if (!applicationToken) {
		throw new Error('Application token is required');
	}

	opts = opts || {};
	opts.crypto = opts.crypto || VirgilCrypto;

	this.applicationToken = applicationToken;
	this.cards = createVirgilCardsApi(applicationToken, opts);
	this.privateKeys = createPrivateKeysApi(applicationToken, opts);
	this.publicKeys = createPublicKeysApi(applicationToken, opts);
	this.identity = createIdentityApi(opts);
}

module.exports = VirgilSDK;
