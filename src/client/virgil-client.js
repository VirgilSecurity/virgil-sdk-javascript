var createReadCardsClient = require('../apis/cards-ro');
var createCardsClient = require('../apis/cards');
var createIdentityClient = require('../apis/identity');
var createRAClient = require('../apis/ra');
var Card = require('./card');
var assert = require('../shared/utils').assert;
var isString = require('../shared/utils').isString;
var isEmpty = require('../shared/utils').isEmpty;
var createError = require('../shared/utils').createError;

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
	var identityClient = createIdentityClient(options);
	var raClient = createRAClient(options);

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
		 * @param {SearchCriteria} criteria
		 * @returns {Promise.<Card[]>}
		 * */
		searchCards: function (criteria) {
			criteria = criteria || {};
			criteria.scope = criteria.scope || 'application';

			return cardsReadOnlyClient.search(criteria)
				.then(function (results) {
					return results.map(responseToCard);
				})
				.then(function (cards) {
					validateCards(cards);
					return cards;
				});
		},

		/**
		 * Publish a new Application Virgil Card in the Virgil PKI Services.
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
		 * Revoke the Application Virgil Card in Virgil PKI Services.
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
		 * Publish a new Global Virgil Card in the Virgil PKI Services.
		 *
		 * @param {PublishCardRequest} request - Request object containing
		 * 		the data required for publishing.
		 * @param {string} validationToken - The card's identity validation
		 * 		token returned by {@link VirgilClient#confirmIdentity} method.
		 *
		 * @returns {Promise.<Card>} A Promise that will be resolved with
		 * 		the published card.
		 * */
		publishGlobalCard: function (request, validationToken) {
			assert(isString(validationToken) && !isEmpty(validationToken),
				'The "validationToken" must be a non-empty string.');

			var requestBody = request.getRequestBody();
			requestBody.meta.validation = {
				token: validationToken
			};

			return raClient.publish(requestBody)
				.then(responseToCard)
				.then(function (card) {
					validateCards(card);
					return card;
				});
		},

		/**
		 * Revoke the Global Virgil Card in the Virgil PKI Services.
		 *
		 * @param {RevokeCardRequest} request - Request object containing
		 * 		the data required for revocation.
		 * @param {string} validationToken - The card's identity validation
		 * 		token returned by {@link VirgilClient#confirmIdentity} method.
		 *
		 * @returns {Promise}
		 * */
		revokeGlobalCard: function (request, validationToken) {
			assert(isString(validationToken) && !isEmpty(validationToken),
				'The "validationToken" argument must be a non-empty string.');

			var requestBody = request.getRequestBody();
			requestBody.meta.validation = {
				token: validationToken
			};

			return raClient.revoke(request.card_id, requestBody);
		},

		/**
		 * Initiates a process of identity verification. Used when creating
		 * Virgil Cards with *global* scope and *email* identity type.
		 * Returns an action id that must be then passed to
		 * {@link VirgilClient#confirmIdentity} method along with the
		 * confirmation code sent to the given email address (identity),
		 * to conclude the verification process.
		 *
		 * @param {string} identity - The identity to verify (i.e. email
		 * 		address).
		 * @param {string} identityType - The type of identity to verify.
		 * @param {Object.<string, string>} [extraFields] - Optional hash with
		 * 		custom parameters that will be passed in confirmation message.
		 * 		E.g. in a hidden form inside of the confirmation email
		 * 		message in case of *email* identity type.
		 *
		 * @returns {Promise.<string>} A Promise that will be resolved with
		 * 		the action id.
		 * */
		verifyIdentity: function (identity, identityType, extraFields) {
			assert(isString(identity) && !isEmpty(identity),
				'Identity to verify must be a non-empty string.');
			assert(isString(identityType) && !isEmpty(identityType),
				'Identity type to verify must be a non-empty string.');


			return identityClient.verify({
				type: identityType,
				value: identity,
				extra_fields: extraFields
			}).then(function (res) {
				return res.data.action_id;
			});
		},

		/**
		 * Concludes the identity ownership verification process corresponding
		 * to the given action id. Returns the confirmation token if the given
		 * code matches the one sent in the confirmation message.
		 *
		 * @param {string} actionId - The action id returned by the
		 * 		{@link VirgilClient#verifyIdentity} method.
		 * @param {string} code - The code sent in the confirmation message to
		 * 		the identity being verified.
		 * @param {Object} [tokenParams] - Optional parameters of the
		 * 		validation token to be returned.
		 * @param {number} [tokenParams.time_to_live=3600] - Lifetime of the
		 * 		generated token in seconds. Default is 3600.
		 * @param {number} [tokenParams.count_to_live=1] - Number of times
		 * 		the generated token can be used. Default is 1.
		 *
		 * @return {Promise.<string>} - A Promise that will be resolved with
		 * 		the generated validation token.
		 * */
		confirmIdentity: function (actionId, code, tokenParams) {
			assert(isString(actionId) && !isEmpty(actionId),
				'Action id to confirm must be a non-empty string.');
			assert(isString(code) && !isEmpty(code),
				'Confirmation code must be a non-empty string.');

			return identityClient.confirm({
				action_id: actionId,
				confirmation_code: code,
				token: tokenParams
			}).then(function (res) {
				return res.data.validation_token;
			});
		},

		/**
		 * Checks if the given validation token is valid for the given
		 * identity. Returns a Promise that is resolved with
		 * <code>true</code> if validation token is valid, or
		 * <code>false</code> otherwise.
		 *
		 * @param {string} identity - The identity.
		 * @param {string} identityType - The identity type.
		 * @param {string} validationToken - The token to check.
		 *
		 * @returns {Promise.<IdentityValidationResult>}
		 * */
		validateIdentity: function (identity, identityType, validationToken) {
			assert(isString(identity) && !isEmpty(identity),
				'Identity to validate must be a non-empty string.');
			assert(isString(identityType) && !isEmpty(identityType),
				'Identity type to validate must be a non-empty string.');
			assert(isString(validationToken) && !isEmpty(validationToken),
				'Validation token must be a non-empty string.');

			return identityClient.validate({
				type: identityType,
				value: identity,
				validation_token: validationToken
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
			throw createError('Card validation failed.', {
				invalidCards: invalidCards
			});
		}
	}
}

function responseToCard (res) {
	var data = res.data || res;
	return Card.import(data);
}

module.exports = createVirgilClient;
