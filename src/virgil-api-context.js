'use strict';

var createVirgilCrypto = require('./crypto/virgil-crypto');
var createVirgilClient = require('./client/virgil-client');
var cardValidator = require('./client/card-validator');
var defaultKeyStorage = require('./key-storage/default-key-storage');
var defaultStorageAdapter = require('./key-storage/adapters');
var appCredentials = require('./app-credentials');
var utils = require('./shared/utils');

/**
 * @typedef {Object} CardVerifierInfo
 * @property {string} cardId - Id of the card whose signature is to be
 * 		verified.
 * @property {(Buffer|string)} publicKeyMaterial - The public key to use
 * 		for signature verification.
 * */

/**
 * @typedef {Object} VirgilAPIConfig
 * @property {string} [accessToken] - The access token required by Virgil Cards
 * 		service to read and write application-level cards.
 * @property {AppCredentialsInfo} [appCredentials] - The application's
 * 		credentials.
 * @property {(CardVerifierInfo|CardVerifierInfo[])} [cardVerifiers] - Object
 * 		(or an array of objects) specifying the ids of Virgil Cards whose
 * 		signatures will be verified on other cards returned by API methods.
 * @property {KeyStorage} [keyStorage] - Custom implementation of private keys storage.
 * @property {Crypto} [crypto] - Custom implementation of crypto operations provider.
 * @property {VirgilClientParams} [clientParams] - Virgil services client initialization
 * 		options.
 *
 * */

/**
 * Creates and initializes the VirgilAPIContext objects.
 *
 * <code>VirgilAPIContext</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>virgilAPIContext()</code>
 * factory function to create an instance.
 *
 * @example
 *
 * var context = virgil.virgilAPIContext({
 * 		accessToken: 'access_token',
 * 		appCredentials: {
 * 			appId: 'appId',
 * 			appKeyMaterial: 'app_key_material_base64',
 * 			appKeyPassword: 'app_key_password'
 * 		},
 * 		cardVerifiers: [{
 *			cardId: 'id_of_card_whose_signature_needs_to_be_verified',
 *		 	publicKeyMaterial: 'public_key_bytes_in_base64'
 * 		}]
 * });
 *
 * @param {VirgilAPIConfig} config - The Virgil API configuration object.
 *
 * @constructs VirgilAPIContext
 * */
function virgilAPIContext (config) {
	utils.assert(utils.isObject(config),
		'virgilAPIContext expects a configuration object to be passed.');


	var crypto = config.crypto || createVirgilCrypto();
	var keyStorage = config.keyStorage ||
		defaultKeyStorage(defaultStorageAdapter({
			dir: 'VirgilSecurityKeys',
			name: 'VirgilSecurityKeys'
		}), crypto);

	var client = createVirgilClient(config.accessToken, config.clientParams);
	var validator = cardValidator(crypto);

	if (config.cardVerifiers) {
		var verifiers = utils.toArray(config.cardVerifiers);
		verifiers.forEach(function (verifier) {
			validator.addVerifier(verifier.cardId, verifier.publicKeyMaterial);
		});
	}

	client.setCardValidator(validator);

	var credentials = config.appCredentials
		? appCredentials(config.appCredentials) : null;

	return /** @lends {VirgilAPIContext} */ {
		/** @type {Crypto} */
		crypto: crypto,
		/** @type {KeyStorage} */
		keyStorage: keyStorage,
		/** @type {AppCredentials} */
		credentials: credentials,
		/** @type {VirgilClient} */
		client: client
	};
}

module.exports = virgilAPIContext;
