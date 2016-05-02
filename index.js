var VirgilCrypto = require('virgil-crypto');
var cryptoAsyncPatch = require('./src/crypto-async-patch');
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
	opts.crypto = cryptoAsyncPatch(opts.crypto || VirgilCrypto.VirgilCrypto || VirgilCrypto);

	this.applicationToken = applicationToken;
	this.crypto = opts.crypto;
	this.cards = createVirgilCardsApi(applicationToken, opts);
	this.privateKeys = createPrivateKeysApi(applicationToken, opts, this.cards);
	this.publicKeys = createPublicKeysApi(applicationToken, opts);
	this.identity = createIdentityApi(opts);
}

var Crypto = VirgilCrypto.VirgilCrypto || VirgilCrypto;

// umd export support
VirgilSDK.VirgilSDK = VirgilSDK;

// Expose some utils
VirgilSDK.utils = {
	obfuscate: Crypto.obfuscate,
	generateValidationToken: Crypto.generateValidationToken
};

// Expose idenity types enum
VirgilSDK.IdentityTypes = Crypto.IdentityTypesEnum;

module.exports = VirgilSDK;
