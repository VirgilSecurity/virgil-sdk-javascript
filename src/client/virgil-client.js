var createReadCardsClient = require('../apis/cards-ro');
var createCardsClient = require('../apis/cards');
var createIdentityClient = require('../apis/identity');
var Card = require('./card');
var assert = require('../shared/utils').assert;
var throwVirgilError = require('../shared/utils').throwVirgilError;

/**
 * @typedef {Object} SearchCriteria
 * @property {string[]} identities - Identity values to search by.
 * @property {string} [identity_type] - Identity type to search.
 * @property {string} [scope='application'] - Cards scope to search in.
 * */

/**
 * Creates and initializes Virgil API client.
 *
 * <code>VirgilClient</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>client()</code> factory
 * function to create an instance.
 *
 * @example
 *
 * var request = virgil.client('access_token');
 *
 * @param {string} accessToken - A token passed with every request for
 *			authorization
 * @param {Object} [options] - Initialization options
 * @param {string} [options.identityBaseUrl] - URL of Virgil Cards service
 * @param {string} [options.cardsBaseUrl] - URL of Virgil Cards service
 * @param {string} [options.cardsReadBaseUrl] - URL of Virgil Cards service
 * 			for read-only access
 *
 * @constructs VirgilClient
 * */
function createVirgilClient(accessToken, options) {
	assert(Boolean(accessToken), 'Access token is required.');
	options = options || {};

	var cardsReadOnlyClient = createReadCardsClient(accessToken, options);
	var cardsClient = createCardsClient(accessToken, options);

	var cardValidator = null;

	return /** @lends VirgilClient */ {


		/**
		 * Get card by id.
		 *
		 * @param {string} cardId - Id of card to get
		 * @returns {Promise.<Card>}
		 * */
		getCard: function (cardId) {
			return cardsReadOnlyClient.get({ card_id: cardId })
				.then(responseToCard)
				.then(function (card) {
					validateCards(card);
					return card;
				});
		},

		/**
		 * Search cards by identity.
		 *
		 * @param {SearchCriteria} params
		 * @returns {Promise.<Card[]>}
		 * */
		searchCards: function (params) {
			params = params || {};
			params.scope = params.scope || 'application';

			return cardsReadOnlyClient.search(params)
				.then(function (results) {
					return results.map(responseToCard);
				})
				.then(function (cards) {
					validateCards(cards);
					return cards;
				});
		},

		/**
		 * Publish a new Card to the Virgil PKI Services.
		 *
		 * @param {PublishCardRequest} request - Request object containing
		 * 		the data required for publishing.
		 * @returns {Promise.<Card>} The published card.
		 * */
		publishCard: function (request) {
			return cardsClient.publish(request.getRequestBody())
				.then(responseToCard)
				.then(function (card) {
					validateCards(card);
					return card;
				});
		},

		/**
		 * Revoke the Virgil Card from Virgil PKI Services.
		 *
		 * @param {RevokeCardRequest} request - Request object containing
		 * 		the data required for revocation.
		 * @returns {Promise}
		 * */
		revokeCard: function (request) {
			var requestData = request.getRequestBody();
			return cardsClient.revoke({
				card_id: request.card_id,
				content_snapshot: requestData.content_snapshot,
				meta: requestData.meta
			});
		},

		/**
		 * Sets an object that will be called to validate the Card's signatures
		 *
		 * @param {Object} validator - The validator object
		 * */
		setCardValidator: function (validator) {
			assert(Boolean(validator), 'Argument "validator" is required');
			cardValidator = validator;
		}
	};

	/**
	 * Validates the cards returned from the server using the card validator.
	 * Throws {VirgilError} if any of the cards is not valid.
	 * @private
	 * */
	function validateCards (cards) {
		if (!cardValidator) {
			return;
		}

		cards = Array.isArray(cards) ? cards : [cards];
		var invalidCards = cards.filter(function (card) {
			return !cardValidator.validate(card);
		});

		if (invalidCards.length) {
			throwVirgilError('Card validation failed.', {
				invalidCards: invalidCards
			});
		}
	}
}

function responseToCard (res) {
	return Card.import(res);
}

module.exports = createVirgilClient;
