var ApiClient = require('apiapi');
var uuid = require('uuid');
var errors = require('./errors');
var errorHandler = require('../utils/error-handler')(errors);
var parseJSON = require('../utils/parse-json');
var createVerifyResponseMethod = require('../utils/verify-response');

module.exports = function createAPIClient (applicationToken, opts, cardsClient) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.publicKeysBaseUrl || 'https://keys.virgilsecurity.com/v3',

		methods: {
			getPublicKey: 'get /public-key/{public_key_id}'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		transformRequest: {
			getPublicKey: getPublicKey
		},

		query: {
			getPublicKey: []
		},

		rawResponse: true,
		responseType: 'text',
		errorHandler: errorHandler,
		transformResponse: transformResponse
	});

	apiClient.crypto = opts.crypto;
	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID : uuid;
	apiClient.getRequestHeaders = getRequestHeaders;
	apiClient.verifyResponse = createVerifyResponseMethod(
		'com.virgilsecurity.keys',
		cardsClient,
		cardsClient.crypto,
		opts.cardsServicePublicKey
	).verifyResponse;

	return apiClient;
};

function getRequestHeaders (requestBody, privateKey, virgilCardId, privateKeyPassword) {
	var requestUUID = this.generateUUID();
	var requestText = requestUUID + JSON.stringify(requestBody);

	return this.crypto.signAsync(requestText, privateKey, privateKeyPassword).then(function(sign) {
		var headers = {
			'X-VIRGIL-REQUEST-SIGN': sign.toString('base64'),
			'X-VIRGIL-REQUEST-ID': requestUUID
		};

		if (virgilCardId) {
			headers['X-VIRGIL-REQUEST-SIGN-VIRGIL-CARD-ID'] = virgilCardId;
		}

		return headers;
	});
}

function getPublicKey (params, requestBody, opts) {
	this.assert(params.public_key_id, 'public_key_id param is required');

	if (params.virgil_card_id && params.private_key) {
		return this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id, params.private_key_password).then(function(headers) {
			opts.headers = headers;
			return [params, requestBody, opts];
		})
	}

	return [params, requestBody, opts];
}

function transformResponse (res) {
	return this.verifyResponse(res).then(function () {
		var body = parseJSON(res.data);

		if (body) {
			if (body.public_key) {
				body.public_key = new Buffer(body.public_key, 'base64').toString('utf8');
			}

			return body;
		}
	});
}
