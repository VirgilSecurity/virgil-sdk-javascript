'use strict';

var axios = require('axios');
var errors = require('./cards-errors');
var handleError = require('../shared/error-handler')(errors);

module.exports = function createReadCardsClient (accessToken, options) {
	options = typeof options === 'object' ? options : {};

	var client = axios.create({
		baseURL: options.cardsReadBaseUrl ||
		'https://cards-ro.virgilsecurity.com/v4',
		headers: {
			'Authorization': 'VIRGIL ' + accessToken
		}
	});

	return {
		/**
		 * Search cards by search criteria.
		 *
		 * @param {SearchCriteria} criteria - The search criteria.
		 * @returns {Promise.<HTTPResponse>}
		 * */
		search: function searchCards (criteria) {
			return client.post('/card/actions/search', criteria)
				.catch(handleError);
		},

		/**
		 * Get the card by id.
		 *
		 * @param {string} cardId - Id of the card.
		 * @returns {Promise.<HTTPResponse>}
		 * */
		get: function getCard (cardId) {
			return client.get('/card/' + encodeURIComponent(cardId))
				.catch(handleError);
		}
	};
};
