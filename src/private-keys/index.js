var ApiClient = require('apiapi');
var Promise = require('bluebird');
var uuid = require('uuid');
var errors = require('./errors');
var errorHandler = require('../utils/error-handler')(errors);
var createFetchServiceCardMethod = require('../utils/verify-response');

module.exports = function createAPIClient (applicationToken, opts, cardsClient) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.privateKeysBaseUrl || 'https://keys-private.virgilsecurity.com/v3',

		methods: {
			stash: 'post /private-key',
			get: 'post /private-key/actions/grab',
			destroy: 'post /private-key/actions/delete'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		transformRequest: {
			stash: stash,
			get: get,
			destroy: destroy
		},

		body: {
			stash: ['private_key', 'virgil_card_id'],
			get: ['identity', 'response_password', 'virgil_card_id'],
			destroy: ['virgil_card_id']
		},

		required: {
			stash: ['private_key', 'virgil_card_id'],
			get: ['identity', 'virgil_card_id'],
			destroy: ['virgil_card_id']
		},

		errorHandler: errorHandler,
		transformResponse: {
			stash: transformResponse,
			get: transformResponseGet,
			destroy: transformResponse
		}
	});

	apiClient.cardsClient = cardsClient;
	apiClient.crypto = opts.crypto;
	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID : uuid;

	apiClient.fetchServiceCard = createFetchServiceCardMethod('com.virgilsecurity.private-keys', cardsClient, cardsClient.crypto).fetchServiceCard;
	apiClient.getRequestHeaders = getRequestHeaders;
	apiClient.encryptBody = encryptBody;

	return apiClient;
};

function stash (params, requestBody, opts) {
	var self = this;

	requestBody.private_key = new Buffer(params.private_key, 'utf8').toString('base64');

	return self.encryptBody(requestBody).then(function encryptStashBody (encryptedRequestBody) {
		return self.getRequestHeaders(requestBody, params.private_key, params.private_key_password).then(function getStashHeaders (headers) {
			opts.headers = headers;
			return [params, encryptedRequestBody, opts];
		});
	});
}

function get (params, requestBody, opts) {
	// the MAX length of password is 31 - wtf?!
	// saving to request and params, to have access in `transformResponse`
	requestBody.response_password = params.response_password = this.generateUUID().replace(/\-/ig, '').substr(0, 31);

	// the response will be a base64 string
	opts.responseType = 'text';

	return this.encryptBody(requestBody).then(function encryptGetBody (encryptedRequestBody) {
		return [params, encryptedRequestBody, opts];
	});
}

function destroy (params, requestBody, opts) {
	var self = this;

	return this.encryptBody(requestBody).then(function encryptDestroyBody (encryptedRequestBody) {
		return self.getRequestHeaders(requestBody, params.private_key, params.private_key_password).then(function getDestroyHeaders (headers) {
			opts.headers = headers;
			return [params, encryptedRequestBody, opts];
		})
	});
}

function getRequestHeaders (requestBody, privateKey, privateKeyPassword) {
	var requestUUID = this.generateUUID();
	var requestText = requestUUID + JSON.stringify(requestBody);

	return this.crypto.signAsync(requestText, privateKey, privateKeyPassword).then(function signHeaders (sign) {
		return {
			'X-VIRGIL-REQUEST-SIGN': sign.toString('base64'),
			'X-VIRGIL-REQUEST-ID': requestUUID
		}
	});
}

function encryptBody (requestBody) {
	var self = this;

	return this.fetchServiceCard()
		.then(function fetchVirgilCard (privateKeysCard) {
			var requestBodyString = JSON.stringify(requestBody);
			var privateKeysServicePublicKey = privateKeysCard.public_key.public_key;

			return self.crypto.encryptAsync(requestBodyString, privateKeysCard.id, privateKeysServicePublicKey)
				.then(function encryptRequestBody (result) {
					return result.toString('base64');
				});
		});
}

function transformResponse (res) {
	var body = res.data;

	if (body) {
		if (body.public_key) {
			body.public_key.public_key = new Buffer(body.public_key.public_key, 'base64').toString('utf8');
		}

		return body;
	}
}

function transformResponseGet (response, originalParams, requestParams) {
	return this.crypto.decryptAsync(new Buffer(response.data, 'base64'), requestParams.response_password).then(function decryptGetResponse (decryptedResponse) {
		var res = JSON.parse(decryptedResponse.toString('utf8'));
		res.private_key = new Buffer(res.private_key, 'base64').toString('utf8');
		return res;
	});
}

function fetchVirgilPrivateKeysCard (cardsClient, identityType) {
	if (fetchVirgilPrivateKeysCard.card) {
		return new Promise(function(resolve) {
			resolve(fetchVirgilPrivateKeysCard.card);
		});
	} else {
		return cardsClient.searchGlobal({ value: PRIVATE_KEYS_SERVICE_APP_ID, type: identityType })
			.then(function searchVirgilCard (cards) {
				return fetchVirgilPrivateKeysCard.card = cards[0];
			});
	}
}
