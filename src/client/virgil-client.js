var createReadCardsClient = require('../apis/cards-ro');
var createCardsClient = require('../apis/cards');
var createIdentityClient = require('../apis/identity');
var Card = require('./card');

/**
 * @typedef {Object} SearchCriteria
 * @property {string[]} identities - Identity values to search by.
 * @property {string} [identity_type] - Identity type to search.
 * @property {string} [scope='application'] - Cards scope to search in.
 * */

/**
 * Creates and initializes Virgil API client
 *
 * @param {string} accessToken - A token passed with every request for authorization
 * @param {Object} [options] - Initialization options
 * @param {string} [options.identityBaseUrl] - URL of Virgil Cards service
 * @param {string} [options.cardsBaseUrl] - URL of Virgil Cards service
 * @param {string} [options.cardsReadBaseUrl] - URL of Virgil Cards service for read-only access
 *
 * @returns {Object} - Virgil Client
 * */
function createVirgilClient(accessToken, options) {
	if (!accessToken) {
		throw new Error('Access token is required.');
	}

	options = options || {};

	var cardsReadOnlyClient = createReadCardsClient(accessToken, options);
	var cardsClient = createCardsClient(accessToken, options);

	var cardValidator = null;
	var validateCards = function (cards) {
		cards = Array.isArray(cards) ? cards : [cards];
		var invalidCards = cards.filter(function (card) { return !cardValidator.validate(card); });
		if (invalidCards.length) {
			var error = new Error('Card validation failed');
			error.invalidCards = invalidCards;
			throw error;
		}
	};

	return {
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
					if (cardValidator) {
						validateCards(card);
					}
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
					if (cardValidator) {
						validateCards(cards);
					}
					return cards;
				});
		},

		/**
		 * Publish a new Card to the Virgil Services.
		 *
		 * @param {PublishCardRequest} request - Request object containing
		 * 		the data required for publishing.
		 * @returns {Promise.<Card>} The published card.
		 * */
		publishCard: function (request) {
			return cardsClient.publish(request.getRequestModel())
				.then(responseToCard)
				.then(function (card) {
					if (cardValidator) {
						validateCards(card);
					}
					return card;
				});
		},

		/**
		 * Revoke a Virgil Card
		 *
		 * @param {Object} request - Revoke Card Request
		 * @returns {Promise}
		 * */
		revokeCard: function (request) {
			var requestData = request.getRequestModel();
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
			if (!validator) {
				throw new TypeError('Argument "validator" is required');
			}

			cardValidator = validator;
		}
	};
}

function responseToCard (res) {
	return Card.import(res);
}

module.exports = createVirgilClient;
