'use strict';

var virgilCrypto = require('./crypto/virgil-crypto');
var virgilClient = require('./client/virgil-client');
var cardValidator = require('./client/card-validator');
var appCredentials = require('./app-credentials');
var initDefaultKeyStorage = require('./key-storage');
var CardServiceVerifierInfo =
	require('./client/card-verifiers/card-service-verifier-info');
var utils = require('./shared/utils');

/**
 * @typedef {Object} VirgilAPIConfiguration
 * @property {string} [accessToken] - The access token required by Virgil Cards
 * 		service to read and write application-level cards.
 * @property {AppCredentialsInfo} [appCredentials] - The application's
 * 		credentials.
 * @property {boolean} [useBuiltInVerifiers] - Optional boolean value
 * 		indicating whether to use the built-in card verifiers when validating
 * 		cards received from Virgil Services.
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
 * @property {(string|KeyPairType)} [defaultKeyPairType] - The type of keys
 * 		generated by <code>virgilAPI.keys.generate</code>.
 * @property {VirgilClientParams} [clientParams] - Virgil services client
 * 		initialization options.
 *
 * */

var DEFAULTS = {
	crypto: virgilCrypto,
	defaultKeyPairType: null,
	useBuiltInVerifiers: true,
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
function VirgilAPIContext(config) {
	if (!(this instanceof VirgilAPIContext)) {
		return new VirgilAPIContext(config);
	}

	/** @type {VirgilAPIConfiguration} */
	this._config = utils.assign({}, DEFAULTS, config);
}

VirgilAPIContext.prototype = {
	get client() {
		return this._client || (this._client = getClient(this._config));
	},

	get credentials() {
		return this._credentials ||
			(this._credentials = getAppCredentials(this._config));
	},

	get crypto() {
		return this._config.crypto;
	},

	get keyStorage() {
		return this._keyStorage ||
			(this._keyStorage = getKeyStorage(this._config));
	},

	get defaultKeyPairType() {
		return this._config.defaultKeyPairType;
	}
};

function getClient(config) {
	var client = virgilClient(
		config.accessToken,
		config.clientParams);

	var validator = getCardValidator(config);

	client.setCardValidator(validator);
	return client;
}

function getKeyStorage(config) {
	return config.keyStorage ||
		initDefaultKeyStorage({
			dir: config.keyStoragePath,
			name: config.keyStorageName
		});
}

function getAppCredentials(config) {
	return config.appCredentials
		? appCredentials(config.appCredentials) : null;
}

function getCardValidator(config) {
	var verifiers = config.useBuiltInVerifiers
		? [CardServiceVerifierInfo] : [];

	if (config.cardVerifiers) {
		verifiers = verifiers.concat(config.cardVerifiers);
	}

	return cardValidator(config.crypto, verifiers)
}


module.exports = VirgilAPIContext;