
'use strict';

var utils = require('./shared/utils');
var takeSnapshot = require('./helpers/take-snapshot');
var virgilCard = require('./virgil-card');
var CardScope = require('./client/card-scope');
var IdentityType = require('./client/card-identity-type');
var RevocationReason = require('./client/card-revocation-reason');
var CardModel = require('./client/card-model');
var revokeCardRequest = require('./client/revoke-card-request');

/**
 * Creates and initializes objects that implement card managing functionality
 * (i.e. create, publish, search, revoke).
 *
 * <code>CardManager</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>cardManager()</code>
 * factory function to create an instance.
 *
 * @example
 *
 * var manager = virgil.cardManager(context);
 *
 * @param {VirgilAPIContext} context - The Virgil API context.
 * @constructs {CardManager}
 */
function cardManager (context) {
	var crypto = context.crypto;
	var client = context.client;

	return /** @lends {CardManager} */ {

		/**
		 * Creates an application-scoped Virgil Card that can be published
		 * in Virgil Services.
		 *
		 * @param {string} identity - The identity.
		 * @param {VirgilKey} ownerKey - The card's owner key.
		 * @param {string} [identityType] - Optional identity type.
		 * 		Default is 'unknown'.
		 * @param {Object.<string, string>} [customFields] - Optional custom
		 * 		attributes of the card.
		 * @returns {VirgilCard}
         */
		create: function (identity, ownerKey, identityType, customFields) {
			var params = {
				identity: identity,
				identity_type: identityType || 'unknown',
				scope: CardScope.APPLICATION,
				data: customFields || null
			};

			var card = createCardModel(params, ownerKey);
			return virgilCard(context, card);
		},

		/**
		 * Creates a global Virgil Card that can be published in Virgil
		 * Services.
		 * @param {string} identity - Identity of the card.
		 * @param {VirgilKey} ownerKey - The card's owner key.
		 * @param {string} [identityType] - Optional identity type of the card.
		 * @param {Object.<string, string>} [customFields] - Optional custom
		 * 		attributes of the card.
		 * @returns {VirgilCard}
         */
		createGlobal: function (identity, ownerKey, identityType, customFields) {
			var params = {
				identity: identity,
				identity_type: identityType || IdentityType.EMAIL,
				scope: CardScope.GLOBAL,
				data: customFields || null
			};

			var card = createCardModel(params, ownerKey);
			return virgilCard(context, card);
		},

		/**
		 * Performs the cards search for the given identity(ies) and optional
		 * identity type in the application scope.
		 *
		 * @param {string|string[]} identity - The identity or an array of
		 * 		identities to search for.
		 * @param {string} [identityType] - The identity type to search for.
		 *
         * @returns {Promise.<VirgilCard>}
         */
		find: function (identity, identityType) {
			return findCards(identity, identityType, CardScope.APPLICATION);
		},

		/**
		 * Performs the cards search for the given identity(ies) and optional
		 * identity type in the global scope.
		 *
		 * @param {string|string[]} identity - The identity or an array of
		 * 		identities to search for.
		 * @param {string} [identityType] - The identity type to search for.
		 *
		 * @returns {Promise.<VirgilCard>}
		 */
		findGlobal: function (identity, identityType) {
			return findCards(identity, identityType, CardScope.GLOBAL);
		},

		/**
		 * Publishes the card on Virgil Services in application scope.
		 *
		 * @param {VirgilCard} card - The card to publish.
		 * @returns {Promise}
         */
		publish: function (card) {
			return card.publish();
		},

		/**
		 * Publishes the card on Virgil Services in global scope.
		 * @param {VirgilCard} card - The card to publish.
		 * @param {string} validationToken - The card's identity validation
		 * 		token.
         * @returns {Promise}
         */
		publishGlobal: function (card, validationToken) {
			return card.publishAsGlobal(validationToken);
		},

		/**
		 * Revokes the card on Virgil Services in application scope.
		 * @param {VirgilCard} card - The card to revoke.
		 * @returns {Promise}
         */
		revoke: function (card) {
			utils.assert(context.credentials,
				'Cannot revoke card in application scope. ' +
				'App credentials are required but missing.');

			var request = revokeCardRequest({
				card_id: card.id,
				revocation_reason: RevocationReason.UNSPECIFIED
			});

			var appId = context.credentials.getAppId();
			var appKey = context.credentials.getAppKey(crypto);
			var fingerprint = crypto.calculateFingerprint(
				request.getSnapshot());
			var signature = crypto.sign(fingerprint, appKey);

			request.appendSignature(appId, signature);
			return client.revokeCard(request);
		},

		/**
		 * Revokes the card on Virgil Services in global scope.
		 * @param {VirgilCard} card - The card to revoke.
		 * @param {VirgilKey} key - The card's private key.
		 * @param {string} validationToken - The card's identity validation
		 * 		token.
		 * @returns {Promise}
		 */
		revokeGlobal: function (card, key, validationToken) {
			var request = revokeCardRequest({
				card_id: card.id,
				revocation_reason: RevocationReason.UNSPECIFIED
			}, validationToken);

			var fingerprint = crypto.calculateFingerprint(
				request.getSnapshot());
			var signature = key.sign(fingerprint);

			request.appendSignature(card.id, signature);
			return client.revokeGlobalCard(request);
		},

		/**
		 * Gets the Virgil Card by id.
		 * @param {string} cardId - Id of the card to get.
		 * @returns {Promise.<VirgilCard>}
         */
		get: function (cardId) {
			return client.getCard(cardId)
				.then(function (card) {
					return virgilCard(context, card);
				});
		},

		/**
		 * Imports the previously exported card from string representation.
		 * @param {string} exportedCard - The base64 encoded string
		 * 		representing the card.
		 * @returns {VirgilCard}
         */
		import: function (exportedCard) {
			var json = utils.base64Decode(exportedCard, 'utf8');
			var model = CardModel.import(json);
			return virgilCard(context, model);
		}
	};

	/**
	 * Creates the card model with the given parameters and key.
	 * @param {Object} params - Card's parameters.
	 * @param {VirgilKey} ownerKey - The card's owner private key.
	 * @returns {CardModel}
	 * @private
     */
	function createCardModel (params, ownerKey) {
		var cardProps = {
			identity: params.identity,
			identity_type: params.identity_type,
			public_key: ownerKey.exportPublicKey().toString('base64'),
			scope: params.scope,
			data: params.data
		};

		var snapshot = takeSnapshot(cardProps);
		var cardFingerprint = crypto.calculateFingerprint(snapshot);
		var cardId = cardFingerprint.toString('hex');
		var cardSignature = ownerKey.sign(cardFingerprint);
		var meta = { signs: {} };
		meta.signs[cardId] = cardSignature;
		cardProps.id = cardId;

		return new CardModel(snapshot, meta, cardProps);
	}

	/**
	 * Performs the cards search for the given identity(ies) and identity
	 * type in the given scope.
	 *
	 * @param {string|string[]} identity - The identity or an array of
	 * 		identities to search for.
	 * @param {string} identityType - The identity type to search for.
	 * @param {CardScope} scope - The scope to search in.
	 *
	 * @returns {Promise.<VirgilCard>}
	 * @private
	 */
	function findCards (identity, identityType, scope) {
		var identities = utils.toArray(identity);
		var criteria = {
			identities: identities,
			identityType: identityType,
			scope: scope
		};

		return client.searchCards(criteria)
			.then(function (cards) {
				return cards.map(function (card) {
					return virgilCard(context, card);
				});
			});
	}
}

module.exports = cardManager;
