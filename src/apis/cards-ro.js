'use strict';

var axios = require('axios');
var errors = require('./cards-errors');
var handleError = require('../shared/error-handler')(errors);
var utils = require('../shared/utils');

var BASE_URL = 'https://cards-ro.virgilsecurity.com/v4';

module.exports = function createReadCardsClient (options) {
	options = utils.isObject(options) ? options : {};

	var headers = options.accessToken ?
		{ 'Authorization': 'VIRGIL ' + options.accessToken } : {};

	var client = axios.create({
		baseURL: options.cardsReadBaseUrl || BASE_URL,
		headers: headers
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
