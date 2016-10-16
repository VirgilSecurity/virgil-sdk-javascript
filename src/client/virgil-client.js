import { createReadCardsClient } from '../virgil-cards/cards-read-client';
import { createCardsClient } from '../virgil-cards/cards-client';

/**
 * @typedef {Object} Card
 * @property {string} id - Card identifier
 * @property {Buffer} snapshot - Card content snapshot
 * @property {Buffer} publicKey - Public key associated with Card
 * @property {string} identity - Card's identity
 * @property {string} identityType - Card's identity type
 * @property {string} scope - Card's scope
 * @property {Object} data - Custom data associated with Card
 * @property {Object} info - Device information associated with Card
 * @property {string} createdAt - UNIX timestamp of the date the Card was created
 * @property {string} version - Version of service API the Card was created with
 * @property {Object} signatures - Card's signatures as <signer_id>:<signature> pairs
 * */

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
export function createVirgilClient(accessToken, options = {}) {
	if (!accessToken) {
		throw new Error('Access token is required.');
	}

	const cardsReadOnlyClient = createReadCardsClient(accessToken, options);
	const cardsClient = createCardsClient(accessToken, options);

	let cardValidator = null;
	const validateCards = function (cards) {
		cards = Array.isArray(cards) ? cards : [cards];
		const invalidCards = cards.filter((card) => !cardValidator.validate(card));
		if (invalidCards.length) {
			throw new Error('Card validation failed.');
		}
	};

	return {
		/**
		 * Get card by id.
		 *
		 * @param {string} cardId - Id of card to get
		 * @returns {Promise.<Card>}
		 * */
		getCard(cardId) {
			return cardsReadOnlyClient.get({ card_id: cardId }).then((card) => {
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
		searchCards(params) {
			const { identities, identity_type, scope = 'application' } = params;
			return cardsReadOnlyClient.search({
				identities,
				identity_type,
				scope
			}).then((cards) => {
				if (cardValidator) {
					validateCards(cards);
				}
				return cards;
			});
		},

		/**
		 * Create a Virgil Card
		 *
		 * @param {Object} request - Create Card Request
		 * @returns {Promise.<Card>}
		 * */
		createCard(request) {
			return cardsClient.create(request.toTransferFormat())
				.then((card) => {
					if (cardValidator) {
						validateCards(card);
					}
					return card;
				});
		},

		/**
		 * Revoke a Virgil Card
		 *
		 * @param {string} cardId - Id of Card to revoke
		 * @param {Object} request - Revoke Card Request
		 * @returns {Promise}
		 * */
		revokeCard(cardId, request) {
			return cardsClient.revoke({
				card_id: cardId,
				...request.toTransferFormat()
			});
		},

		/**
		 * Sets an object that will be called to validate the Card's signatures
		 *
		 * @param {Object} validator - The validator object
		 * */
		setCardValidator(validator) {
			if (!validator) {
				throw new TypeError('Argument "validator" is required');
			}

			cardValidator = validator;
		}
	};
}
