'use strict';

var utils = require('./shared/utils');
var SignableRequest = require('./client/signable-request');
var requestSigner = require('./client/request-signer');

/**
 * A wrapper on CardModel objects providing easier access to common operations
 * performed with cards (e.g. encrypt and verify data, publish cards, etc.)
 *
 * @param {VirgilAPIContext} context - Virgil API context.
 * @param {CardModel} card - The card model to wrap.
 * @constructor
 */
function VirgilCard (context, card) {
	/**
	 * @type {VirgilAPIContext}
	 * @private
     */
	this._context = context;

	/**
	 * @type {CardModel}
	 * @private
	 * */
	this._card = card;

	// card.publicKey is a Buffer containing key material, which has to be
	// imported in order to be usable for cryptographic operations
	/**
	 * @type {CryptoKeyHandle}
	 * @private
	 * */
	this._publicKey = context.crypto.importPublicKey(card.publicKey);
}

VirgilCard.prototype = {
	/**
	 * Gets the Id of the card.
	 * @returns {string}
	 */
	get id () {
		return this._card.id;
	},

	/**
	 * Gets the identity of the card.
	 * @returns {string}
	 */
	get identity () {
		return this._card.identity;
	},

	/**
	 * Gets the identity type of the card.
	 * @returns {string}
	 */
	get identityType () {
		return this._card.identityType;
	},

	/**
	 * Gets the custom fields of the card.
	 * @returns {Object.<string, string>}
	 */
	get customFields () {
		return this._card.data;
	},

	/**
	 * Gets the date the card was created at.
	 * @returns {Date}
	 */
	get createdAt () {
		return this._card.createdAt;
	},

	/**
	 * Gets the handle to the public key of the card.
	 * @returns {CryptoKeyHandle}
	 */
	get publicKey () {
		return this._publicKey;
	}
};

/**
 * Encrypts the data with the card's public key.
 * @param {(string|Buffer)} data - The data to encrypt. If data is a
 * 		string, an encoding of UTF-8 is assumed.
 * @returns {Buffer}
 */
VirgilCard.prototype.encrypt = function (data) {
	return this._context.crypto.encrypt(data, this._publicKey);
};

/**
 * Verifies the data using the signature and the card's public key.
 * @param {(string|Buffer)} data - The data to verify. If data is a
 * 		string, an encoding of UTF-8 is assumed.
 * @param {Buffer} signature - The signature.
 * @returns {boolean} - True if the signature is valid for the data
 * 		and public key, otherwise False.
 */
VirgilCard.prototype.verify = function (data, signature) {
	return this._context.crypto.verify(data, signature, this._publicKey);
};

/**
 * Function to call to confirm the identity ownership and get the
 * validation token.
 * @name confirmIdentityCallback
 * @function
 * @param {string} confirmationCode - The identity confirmation code.
 * @param {{ time_to_live: number, count_to_live_number}} [tokenParams]
 * 		Desired parameters of the generated validation token. Optional.
 */

/**
 * Initiates a process of confirming the ownership of the card's
 * identity.
 * @param {Object.<string, string>} [extraFields] - Optional hash with
 * 		custom parameters that will be passed in confirmation message.
 *
 * @returns {Promise.<confirmIdentityCallback>}
 */
VirgilCard.prototype.checkIdentity = function (extraFields) {
	var client = this._context.client;
	var card = this._card;
	extraFields = utils.isObject(extraFields) ? extraFields : {};
	return client.verifyIdentity(card.identity, card.identityType, extraFields)
		.then(function (actionId) {
			return function confirmIdentityCallback (
				confirmationCode,
				tokenParams) {
				return client.confirmIdentity(
					actionId, confirmationCode, tokenParams);
			};
		});
};

/**
 * Publishes the card on Virgil Services in application scope.
 * @returns {Promise}
 */
VirgilCard.prototype.publish = function () {
	utils.assert(this._context.credentials,
		'Cannot publish card in application scope. ' +
		'App credentials are required but missing.');

	var that = this;
	var card = this._card;

	var params = toRequestParams(card);
	var request = new SignableRequest(
		card.snapshot,
		card.signatures,
		params);

	var appId = this._context.credentials.getAppId();
	var appKey = this._context.credentials.getAppKey(this._context.crypto);
	var signer = requestSigner(this._context.crypto);

	signer.authoritySign(request, appId, appKey);

	return this._context.client.publishCard(request)
		.then(function (publishedCard) {
			that._card = publishedCard;
		});
};

/**
 * Publishes the card on Virgil Services in global scope.
 * @param {string} validationToken - The card's identity validation
 * 		token.
 * @returns {Promise}
 */
VirgilCard.prototype.publishAsGlobal = function (validationToken) {
	var that = this;
	var card = this._card;
	var params = toRequestParams(card);
	var request = new SignableRequest(
		card.snapshot,
		card.signatures,
		params,
		validationToken
	);

	return this._context.client.publishGlobalCard(request)
		.then(function (publishedCard) {
			that._card = publishedCard;
		});
};

/**
 * Exports the card into a string representation suitable for transfer.
 * @returns {string} - Base64 encoded string.
 */
VirgilCard.prototype.export = function () {
	var model = JSON.stringify(this._card.export());
	return utils.base64Encode(model, 'utf8');
};

/**
 * Constructs the publish card request parameters from the card model.
 * @param {CardModel} card - The card model.
 * @returns {Object}
 *
 * @private
 */
function toRequestParams (card) {
	var params = {
		identity: card.identity,
		identity_type: card.identityType,
		scope: card.scope,
		public_key: utils.base64Encode(card.publicKey),
		data: card.data
	};

	if (card.device || card.deviceName) {
		params.info = {
			device: card.device,
			device_name: card.deviceName
		};
	}

	return params;
}

module.exports = VirgilCard;
