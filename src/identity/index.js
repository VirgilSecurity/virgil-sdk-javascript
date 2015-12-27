var Virgil = require('virgil-crypto');
var assert = require('assert');
var ApiClient = require('apiapi');
var uuid = require('node-uuid');
var errors = require('./errors');
var errorHandler = require('../error-handler')(errors);

var signer = new Virgil.Signer();

module.exports = function createAPIClient (opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.identityBaseUrl || 'https://identity.virgilsecurity.com/v1',

		methods: {
			verify: 'post /verify',
			confirm: 'post /confirm',
			validate: 'post /validate',
		},

		before: {
			verify: verify,
			confirm: confirm,
			validate: validate,
		},

		body: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		errorHandler: errorHandler
	});

	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID: uuid;
	return apiClient;
}

function verify (params, requestBody, opts) {
	assert(params.type, 'type param is required');
	assert(params.value, 'value param is required');
	return [params, requestBody, opts];
}

function confirm (params, requestBody, opts) {
	assert(params.confirmation_code, 'confirmation_code param is required');
	assert(params.action_id, 'action_id param is required');
	assert(params.token, 'token param is required');

	return [params, requestBody, opts];
}

function validate (params, requestBody, opts) {
	assert(params.type, 'type param is required');
	assert(params.value, 'value param is required');
	assert(params.validation_token, 'validation_token param is required');

	return [params, requestBody, opts];
}
