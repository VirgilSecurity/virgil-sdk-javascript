'use strict';

var axios = require('axios');
var errors = require('./cards-errors');
var handleError = require('../shared/error-handler')(errors);
var utils = require('../shared/utils');

var BASE_URL = 'https://cards.virgilsecurity.com/v4';

module.exports = function createCardsClient (options) {
	options = utils.isObject(options) ? options : {};

	var headers = options.accessToken ?
		{ 'Authorization': 'VIRGIL ' + options.accessToken } : {};

	var client = axios.create({
		baseURL: options.cardsBaseUrl || BASE_URL,
		headers: headers
	});

	return {
		/**
		 * Publish a new Application Virgil Card in the Virgil PKI Services.
		 *
		 * @param {SignedRequestBody} data - The card's data.
		 * @returns {Promise.<HTTPResponse>}
		 * */
		publish: function (data) {
			return client.post('/card', data).catch(handleError);
		},

		/**
		 * Revoke the Global Virgil Card in the Virgil PKI Services.
		 *
		 * @param {string} cardId - Id of the card to revoke.
		 * @param {SignedRequestBody} data - The data required for revocation.
		 *
		 * @returns {Promise.<HTTPResponse>}
		 * */
		revoke: function (cardId, data) {
			var dataJSON = JSON.stringify(data);
			return client.request({
				method: 'DELETE',
				url: '/card/' + encodeURIComponent(cardId),
				data: dataJSON,
				headers: {
					'Content-Type': 'application/json;charset=utf-8'
				}
			}).catch(handleError);
		}
	};
};
