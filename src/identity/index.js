var ApiClient = require('apiapi');
var errors = require('./errors');
var errorHandler = require('../utils/error-handler')(errors);
var parseJSON = require('../utils/parse-json');
var createVerifyResponseMethod = require('../utils/verify-response');

module.exports = function createAPIClient (opts, cardsClient) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.identityBaseUrl || 'https://identity.virgilsecurity.com/v1',

		methods: {
			verify: 'post /verify',
			confirm: 'post /confirm',
			validate: 'post /validate'
		},

		transformRequest: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		transformResponse: transformResponse,

		required: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		rawResponse: true,
		errorHandler: errorHandler
	});

	apiClient.verifyResponse = createVerifyResponseMethod(
		'com.virgilsecurity.identity',
		cardsClient,
		cardsClient.crypto,
		opts.identityServicePublicKey
	).verifyResponse;

	return apiClient;
};

function transformResponse (res) {
	return this.verifyResponse(res)
		.then(function parseResponse () {
			return parseJSON(res.data);
		})
}
