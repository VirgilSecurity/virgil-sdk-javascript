var Virgil = require('virgil-crypto');
var ApiClient = require('apiapi');
var uuid = require('node-uuid');
var errors = require('./errors');
var errorHandler = require('../error-handler')(errors);

var signer = new Virgil.Signer();

module.exports = function createAPIClient (applicationToken, opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.cardsBaseUrl || 'https://keys.virgilsecurity.com/v2',

		methods: {
			createVirgilCard: 'post /virgil-card',
			signVirgilCard: 'post /virgil-card/{virgil_card_id}/actions/sign',
			unsignVirgilCard: 'post /virgil-card/{virgil_card_id}/actions/unsign',
			searchVirgilCard: 'post /virgil-card/actions/search'
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		before: {
			createVirgilCard: createVirgilCard,
			signVirgilCard: signVirgilCard,
			unsignVirgilCard: unsignVirgilCard,
			searchVirgilCard: searchVirgilCard
		},

		body: {
			createVirgilCard: ['public_key_id', 'public_key', 'identity', 'data'],
			signVirgilCard: ['signed_virgil_card_id', 'signed_digest'],
			unsignVirgilCard: ['signed_virgil_card_id'],
			searchVirgilCard: ['value', 'type', 'relations', 'include_unconfirmed']
		},

		required: {
			signVirgilCard: ['signed_virgil_card_id', 'signed_digest', 'private_key', 'virgil_card_id'],
			unsignVirgilCard: ['signed_virgil_card_id', 'private_key', 'virgil_card_id'],
			searchVirgilCard: ['value', 'type', 'virgil_card_id', 'private_key']
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
	requestBody.signed_digest = signer.sign(params.signed_virgil_card_hash, params.private_key).toString('base64');
	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function unsignVirgilCard (params, requestBody, opts) {
	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function searchVirgilCard (params, requestBody, opts) {
	opts.headers = this.getRequestHeaders(requestBody, params.private_key, params.virgil_card_id);
	return [params, requestBody, opts];
}

function createVirgilCard (params, requestBody, opts) {
	this.assert(params.private_key, 'private_key param is required');
	this.assert(params.public_key || params.public_key_id, 'public_key or public_key_id param is required');
	this.assert(params.identity, 'identity param is required')

	if (params.public_key) {
		requestBody.public_key = new Buffer(params.public_key, 'utf8').toString('base64');
	}

	opts.headers = this.getRequestHeaders(requestBody, params.private_key);
	return [params, requestBody, opts];
}

function parseResponse (res) {
	var body = res.data;

	if (body) {
		if (body.public_key) {
			body.public_key.public_key = new Buffer(body.public_key.public_key, 'base64').toString('utf8');
		}
		return body;
	}
}
