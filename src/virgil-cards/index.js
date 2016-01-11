var ApiClient = require('apiapi');
var uuid = require('node-uuid');
var errors = require('./errors');
var errorHandler = require('../error-handler')(errors);

module.exports = function createAPIClient (applicationToken, opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.cardsBaseUrl || 'https://keys.virgilsecurity.com/v2',

		methods: {
			create: 'post /virgil-card',
			trust: 'post /virgil-card/{virgil_card_id}/actions/sign',
			untrust: 'post /virgil-card/{virgil_card_id}/actions/unsign',
			search: 'post /virgil-card/actions/search',
			searchApp: 'post /virgil-card/actions/search/app'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		transformRequest: {
			create: create,
			trust: trust,
			untrust: untrust
		},

		body: {
			create: ['public_key_id', 'public_key', 'identity', 'data'],
			trust: ['signed_virgil_card_id', 'signed_digest'],
			unsign: ['signed_virgil_card_id'],
			search: ['value', 'type', 'relations', 'include_unconfirmed'],
			searchApp: ['value']
		},

		required: {
			trust: ['signed_virgil_card_id', 'signed_virgil_card_hash', 'private_key', 'virgil_card_id'],
			untrust: ['signed_virgil_card_id', 'private_key', 'virgil_card_id'],
			search: ['value', 'type'],
			searchApp: ['value']
		},

		errorHandler: errorHandler,
		transformResponse: transformResponse
	});

	apiClient.crypto = opts.crypto;
	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID : uuid;
	apiClient.getRequestHeaders = getRequestHeaders;

	return apiClient;
};

function trust (params, requestBody, opts) {
	return this.crypto.signAsync(params.signed_virgil_card_hash, params.private_key, params.private_key_password).then(function(signedDigest) {
		requestBody.signed_digest = signedDigest.toString('base64');

		return this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id, params.private_key_password).then(function(headers) {
			opts.headers = headers;
			return [params, requestBody, opts];
		});
	});
}

function untrust (params, requestBody, opts) {
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
	var body = res.data;

	if (body) {
		if (body.public_key) {
			body.public_key.public_key = new Buffer(body.public_key.public_key, 'base64').toString('utf8');
		}
		return body;
	}
}
