'use strict';

var axios = require('axios');
var errors = require('./ra-errors');
var errorHandler = require('../shared/error-handler')(errors);

module.exports = function createRegistrationAuthorityClient (options) {
	var baseURL = options.registrationAuthorityBaseUrl ||
		'https://ra.virgilsecurity.com/v1';

	var client = axios.create({
		baseURL: baseURL
	});

	return {
		publish: function publish (data) {
			return client.post('/card', data).catch(errorHandler);
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
				.catch(errorHandler);
		}
	};
};
