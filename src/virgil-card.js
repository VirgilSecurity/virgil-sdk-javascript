'use strict';

var utils = require('./shared/utils');
var SignableRequest = require('./client/signable-request');
var requestSigner = require('./client/request-signer');

/**
 * Creates and initializes the VirgilCard objects, a wrapper on CardModel
 * objects providing easier access to common operations performed on cards
 * (e.g. encrypt and verify data, publish cards, etc.)
 *
 * @param {VirgilAPIContext} context - Virgil API context.
 * @param {CardModel} card - The card model to wrap.
 * @constructs {VirgilCard}
 */
function virgilCard (context, card) {
	var crypto = context.crypto;
	var client = context.client;
	var publicKey = crypto.importPublicKey(card.publicKey);

	return /** @lends {VirgilCard} */ {
		/**
		 * Gets the Id of the card.
		 * @returns {string}
         */
		get id () {
			return card.id
		},

		/**
		 * Gets the identity of the card.
		 * @returns {string}
		 */
		get identity () {
			return card.identity;
		},

		/**
		 * Gets the identity type of the card.
		 * @returns {string}
		 */
		get identityType () {
			return card.identityType;
		},

		/**
		 * Gets the custom fields of the card.
		 * @returns {Object.<string, string>}
		 */
		get customFields () {
			return card.data;
		},

		/**
		 * Gets the date the card was created at.
		 * @returns {Date}
		 */
		get createdAt () {
			return card.createdAt;
		},

		/**
		 * Gets the handle to the public key of the card.
		 * @returns {CryptoKeyHandle}
		 */
		get publicKey () {
			return publicKey;
		},

		/**
		 * Encrypts the data with the card's public key.
		 * @param {(string|Buffer)} data - The data to encrypt. If data is a
		 * 		string, an encoding of UTF-8 is assumed.
		 * @returns {Buffer}
         */
		encrypt: function (data) {
			return crypto.encrypt(data, publicKey);
		},

		/**
		 * Verifies the data using the signature and the card's public key.
		 * @param {(string|Buffer)} data - The data to verify. If data is a
		 * 		string, an encoding of UTF-8 is assumed.
		 * @param {Buffer} signature - The signature.
         * @returns {boolean} - True if the signature is valid for the data
		 * 		and public key, otherwise False.
         */
		verify: function (data, signature) {
			return crypto.verify(data, signature, publicKey);
		},

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
		checkIdentity: function (extraFields) {
			extraFields = utils.isObject(extraFields) ? extraFields : {};
			return client.verifyIdentity(
				card.identity,
				card.identityType,
				extraFields).then(function (actionId) {
					return function confirmIdentityCallback (
						confirmationCode,
						tokenParams) {
						return client.confirmIdentity(
							actionId, confirmationCode, tokenParams);
					};
				});
		},

		/**
		 * Publishes the card on Virgil Services in application scope.
		 * @returns {Promise}
         */
		publish: function () {
			utils.assert(context.credentials,
				'Cannot publish card in application scope. ' +
				'App credentials are required but missing.');

			var params = toRequestParams(card);
			var request = new SignableRequest(
				card.snapshot,
				card.signatures,
				params);

			var appId = context.credentials.getAppId();
			var appKey = context.credentials.getAppKey(crypto);
			var signer = requestSigner(crypto);

			signer.authoritySign(request, appId, appKey);

			return client.publishCard(request)
				.then(function (publishedCard) {
					card = publishedCard;
				});
		},

		/**
		 * Publishes the card on Virgil Services in global scope.
		 * @param {string} validationToken - The card's identity validation
		 * 		token.
		 * @returns {Promise}
         */
		publishAsGlobal: function (validationToken) {
			var params = toRequestParams(card);
			var request = new SignableRequest(
				card.snapshot,
				card.signatures,
				params,
				validationToken);

			return client.publishGlobalCard(request)
				.then(function (publishedCard) {
					card = publishedCard;
				});
		},

		/**
		 * Exports the card into a string representation suitable for transfer.
		 * @returns {string} - Base64 encoded string.
         */
		export: function () {
			var model = JSON.stringify(card.export());
			return utils.base64Encode(model, 'utf8');
		}
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
}

module.exports = virgilCard;
