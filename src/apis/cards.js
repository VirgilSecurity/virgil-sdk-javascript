'use strict';

var axios = require('axios');
var errors = require('./cards-errors');
var handleError = require('../shared/error-handler')(errors);

module.exports = function createCardsClient (accessToken, options) {
	options = typeof options === 'object' ? options : {};

	var client = axios.create({
		baseURL: options.cardsBaseUrl || 'https://cards.virgilsecurity.com/v4',
		headers: {
			'Authorization': 'VIRGIL ' + accessToken
		}
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
