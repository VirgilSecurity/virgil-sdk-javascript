var ApiClient = require('apiapi');
var errors = require('./identity-errors');
var errorHandler = require('../utils/error-handler')(errors);

function createIdentityClient (opts) {
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

		required: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		errorHandler: errorHandler
	});

	return apiClient;
}

module.exports = createIdentityClient;
