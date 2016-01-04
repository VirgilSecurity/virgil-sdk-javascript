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
	// trying to get crypto from opts, then checking the es6 module default,
	// otherwise simply required crypto module
	opts.crypto = opts.crypto || VirgilCrypto;

	this.applicationToken = applicationToken;
	this.crypto = opts.crypto;
	this.cards = createVirgilCardsApi(applicationToken, opts);
	this.privateKeys = createPrivateKeysApi(applicationToken, opts);
	this.publicKeys = createPublicKeysApi(applicationToken, opts);
	this.identity = createIdentityApi(opts);
}

// umd export support
VirgilSDK.VirgilSDK = VirgilSDK;

module.exports = VirgilSDK;
