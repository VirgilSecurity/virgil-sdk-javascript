var ApiClient = require('apiapi');
var uuid = require('uuid');
var errors = require('./errors');
var parseJSON = require('../utils/parse-json');
var errorHandler = require('../utils/error-handler')(errors);
var createVerifyResponseMethod = require('../utils/verify-response');

module.exports = function createAPIClient (applicationToken, opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.cardsBaseUrl || 'https://keys.virgilsecurity.com/v3',

		methods: {
			create: 'post /virgil-card',
			revoke: 'delete /virgil-card/{virgil_card_id}',
			search: 'post /virgil-card/actions/search',
			searchGlobal: 'post /virgil-card/actions/search/{type}'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		responseType: 'text',
		rawResponse: true,

		transformRequest: {
			create: create,
			revoke: revoke
		},

		body: {
			create: ['public_key_id', 'public_key', 'identity', 'data'],
			revoke: ['identity'],
			searchGlobal: ['value', 'type', 'include_unauthorized'],
			search: ['value', 'type']
		},

		required: {
			searchGlobal: ['value', 'type'],
			search: ['value']
		},

		errorHandler: errorHandler,

		transformResponse: {
			create: transformResponse,
			revoke: transformResponse,
			search: transformSearchResponse,
			searchGlobal: transformSearchResponse
		}
	});

	apiClient.crypto = opts.crypto;
	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID : uuid;
	apiClient.getRequestHeaders = getRequestHeaders;
	apiClient.verifyResponse = createVerifyResponseMethod(
		'com.virgilsecurity.keys',
		apiClient,
		apiClient.crypto,
		opts.cardsServicePublicKey
	).verifyResponse;

	return apiClient;
};


function revoke (params, requestBody, opts) {
	return this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id, params.private_key_password).then(function(headers) {
		opts.headers = headers;
		return [params, requestBody, opts];
	});
}

function create (params, requestBody, opts) {
	this.assert(params.private_key, 'private_key param is required');
	this.assert(params.public_key || params.public_key_id, 'public_key or public_key_id param is required');
	this.assert(params.identity, 'identity param is required');

	if (params.public_key) {
		requestBody.public_key = new Buffer(params.public_key, 'utf8').toString('base64');
	}

	return this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id, params.private_key_password).then(function(headers) {
		opts.headers = headers;
		return [params, requestBody, opts];
	});
}

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

function transformResponse (res) {
	return this.verifyResponse(res)
		.then(function (card) {
			return transformRequestPublicKey(parseJSON(res.data));
		});
}

function transformSearchResponse (res, params) {
	if (params.ignore_verification) {
		return parseJSON(res.data).map(transformRequestPublicKey, []);
	}

	return this.verifyResponse(res)
		.then(function () {
			return parseJSON(res.data).map(transformRequestPublicKey, []);
		});
}

function transformRequestPublicKey (data) {
	if (data && data.public_key) {
		data.public_key.public_key = new Buffer(data.public_key.public_key, 'base64').toString('utf8');
	}

	return data;
}
