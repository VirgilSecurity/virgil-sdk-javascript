'use strict';

var virgilCrypto = require('./crypto/virgil-crypto');
var virgilClient = require('./client/virgil-client');
var cardValidator = require('./client/card-validator');
var appCredentials = require('./app-credentials');
var initDefaultKeyStorage = require('./key-storage');
var utils = require('./shared/utils');

/**
 * @typedef {Object} CardVerifierInfo
 * @property {string} cardId - Id of the card whose signature is to be
 * 		verified.
 * @property {(Buffer|string)} publicKeyData - The public key to use
 * 		for signature verification.
 * */

/**
 * @typedef {Object} VirgilAPIConfiguration
 * @property {string} [accessToken] - The access token required by Virgil Cards
 * 		service to read and write application-level cards.
 * @property {AppCredentialsInfo} [appCredentials] - The application's
 * 		credentials.
 * @property {(CardVerifierInfo|CardVerifierInfo[])} [cardVerifiers] - Object
 * 		(or an array of objects) specifying the ids of Virgil Cards whose
 * 		signatures will be verified on other cards returned by API methods.
 * @property {KeyStorage} [keyStorage] - Custom implementation of private keys
 * 		storage.
 * @property {string} [keyStoragePath] - File system path to the folder where
 * 		private keys will be stored by default. Node.js only.
 * @property {string} [keyStorageName] - Name of the store where private keys
 * 		will be stored by default. Browsers only.
 * @property {Crypto} [crypto] - Custom implementation of crypto operations
 * 		provider.
 * @property {VirgilClientParams} [clientParams] - Virgil services client
 * 		initialization options.
 *
 * */

var DEFAULTS = {
	crypto: virgilCrypto,
	keyStoragePath: './VirgilSecurityKeys',
	keyStorageName: 'VirgilSecurityKeys'
};

/**
 * A class representing Virgil API Client execution context.
 *
 * @param {VirgilAPIConfiguration} config - - The Virgil API configuration
 * 		object.
 * @constructor
 */
function VirgilAPIContext (config) {
	if (!(this instanceof VirgilAPIContext)) {
		return new VirgilAPIContext(config);
	}

	/** @type {VirgilAPIConfiguration} */
	this._config = utils.assign({}, DEFAULTS, config);
}

VirgilAPIContext.prototype = {
	get client () {
		return this._client || (this._client = getClient(this._config));
	},

	get credentials () {
		return this._credentials ||
			(this._credentials = getAppCredentials(this._config));
	},

	get crypto () {
		return this._config.crypto;
	},

	get keyStorage () {
		return this._keyStorage ||
			(this._keyStorage = getKeyStorage(this._config));
	}
};

function getClient (config) {
	var client = virgilClient(
		config.accessToken,
		config.clientParams);

	var validator = cardValidator(config.crypto);

	if (config.cardVerifiers) {
		var verifiers = utils.toArray(config.cardVerifiers);
		verifiers.forEach(function (verifier) {
			validator.addVerifier(verifier.cardId, verifier.publicKeyData);
		});
	}

	client.setCardValidator(validator);
	return client;
}

function getKeyStorage (config) {
	return config.keyStorage ||
		initDefaultKeyStorage({
			dir: config.keyStoragePath,
			name: config.keyStorageName
		});
}

function getAppCredentials (config) {
	return config.appCredentials
		? appCredentials(config.appCredentials) : null;
}



module.exports = VirgilAPIContext;
