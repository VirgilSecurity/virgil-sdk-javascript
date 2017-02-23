'use strict';

var axios = require('axios');
var errors = require('./ra-errors');
var handleError = require('../shared/error-handler')(errors);

module.exports = function createRegistrationAuthorityClient (options) {
	options = typeof options === 'object' ? options : {};

	var baseURL = options.registrationAuthorityBaseUrl ||
		'https://ra.virgilsecurity.com/v1';

	var client = axios.create({
		baseURL: baseURL
	});

	return {
		/**
		 * Publish a new Global Virgil Card in the Virgil PKI Services.
		 *
		 * @param {SignedRequestBody} data - The card's data.
		 * @param {string} validationToken - The card's identity validation
		 * 		token returned by {@link VirgilClient#confirmIdentity} method.
		 *
		 * @returns {Promise.<CardModel>} A Promise that will be resolved with
		 * 		the published card.
		 * */
		publish: function publish (data) {
			return client.post('/card', data).catch(handleError);
		},

		revoke: function revoke (cardId, data) {
			var dataJSON = JSON.stringify(data);
			return client.request(
				{
					method: 'DELETE',
					url: '/card/' + encodeURIComponent(cardId),
					data: dataJSON,
					headers: {
						'Content-Type': 'application/json;charset=utf-8'
					}
				})
				.catch(handleError);
		}
	};
};
