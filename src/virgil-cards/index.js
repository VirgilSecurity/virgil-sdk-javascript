var Virgil = require('virgil-crypto');
var assert = require('assert');
var ApiClient = require('apiapi');
var uuid = require('node-uuid');
var errors = require('./errors');

var signer = new Virgil.Signer();

module.exports = function createAPIClient (applicationToken, opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.cardsBaseUrl || 'https://keys.virgilsecurity.com/v2',

		methods: {
			getPublicKey: 'get /public-key/{public_key_id}',
			createVirgilCard: 'post /virgil-card',
			signVirgilCard: 'post /virgil-card/{virgil_card_id}/actions/sign',
			unsignVirgilCard: 'post /virgil-card/{virgil_card_id}/actions/unsign',
			searchVirgilCard: 'post /virgil-card/actions/search'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		before: {
			getPublicKey: getPublicKey,
			createVirgilCard: createVirgilCard,
			signVirgilCard: signVirgilCard,
			unsignVirgilCard: unsignVirgilCard,
			searchVirgilCard: searchVirgilCard
		},

		query: {
			getPublicKey: []
		},

		body: {
			createVirgilCard: ['public_key_id', 'public_key', 'identity', 'data'],
			signVirgilCard: ['signed_virgil_card_id', 'signed_digest'],
			unsignVirgilCard: ['signed_virgil_card_id'],
			searchVirgilCard: ['value', 'type', 'relations', 'include_unconfirmed']
		},

		errorHandler: errorHandler,
		parse: parseResponse
	});

	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID: uuid;
	apiClient.getRequestHeaders = getRequestHeaders;
	return apiClient;
}

function getRequestHeaders (requestBody, privateKey, virgilCardId) {
	var requestUUID = this.generateUUID();
	var requestText = requestUUID + JSON.stringify(requestBody);

	var headers = {
		'X-VIRGIL-REQUEST-SIGN': signer.sign(requestText, privateKey).toString('base64'),
		'X-VIRGIL-REQUEST-UUID': requestUUID,
	};

	if (virgilCardId) {
		headers['X-VIRGIL-REQUEST-SIGN-VIRGIL-CARD-ID'] = virgilCardId;
	}

	return headers;
}

function signVirgilCard (params, requestBody, opts) {
	assert(params.signed_virgil_card_id, 'signed_virgil_card_id is required');
	assert(params.signed_virgil_card_hash, 'signed_virgil_card_hash is required');
	assert(params.private_key, 'private_key is required');
	assert(params.virgil_card_id, 'virgil_card_id is required');

	requestBody.signed_digest = signer.sign(params.signed_virgil_card_hash, params.private_key).toString('base64');
	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function unsignVirgilCard (params, requestBody, opts) {
	assert(params.signed_virgil_card_id, 'signed_virgil_card_id is required');
	assert(params.private_key, 'private_key is required');
	assert(params.virgil_card_id, 'virgil_card_id is required');

	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function searchVirgilCard (params, requestBody, opts) {
	assert(params.type, 'type param is required');
	assert(params.value, 'value param is required');
	assert(params.virgil_card_id, 'virgil_card_id param is required');
	assert(params.private_key, 'private_key param is required');

	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function getPublicKey (params, requestBody, opts) {
	assert(params.public_key_id, 'public_key_id param is required');

	if (params.virgil_card_id && params.private_key) {
		opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	}

	return [params, requestBody, opts];
}

function createVirgilCard (params, requestBody, opts) {
	assert(params.private_key, 'private_key is required to sign request');
	assert(params.public_key || params.public_key_id, 'public_key or public_key_id is required');
	assert(params.identity, 'identity object is required')

	if (params.public_key) {
		requestBody.public_key = new Buffer(params.public_key, 'utf8').toString('base64');
	}

	opts.headers = this.getRequestHeaders(requestBody, params.private_key);
	return [params, requestBody, opts];
}

function parseResponse (res) {
	if (res.status === 404) {
		throw new Error('Item not found');
	}

	var body = res.data;
	if (body) {
		if (body.public_key) {
			body.public_key.public_key = new Buffer(body.public_key.public_key, 'base64').toString('utf8');
		}
		return body;
	}
}

function errorHandler (res) {
	if (res.data.code) {
		throw createError(res.data.code);
	}

	throw new Error(res);
}

function createError (code) {
	var err = new Error();
	err.message = errors[code];
	err.code = code;
	return err;
}
