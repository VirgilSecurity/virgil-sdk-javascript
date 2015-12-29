var ApiClient = require('apiapi');
var uuid = require('node-uuid');
var errors = require('./errors');
var errorHandler = require('../error-handler')(errors);

var PRIVATE_KEYS_SERVICE_APP_ID = 'user@virgilsecurity.com';
var PRIVATE_KEYS_SERVICE_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDQOBggAEnsoNapK9CZjl5p9b1eF85IyC\nG6RrDo1rsNY99CJlDw0B7018YcqZIJT6gGn2t4CgoS0gCm7SOTMr9xahfJ9m10kw\n69Fb6qOW1oFUYGFZOw0p5bzYv8zh3WJnbr/JhvPm49Rp73j4vYW9z3xx4yFuOh6D\n6etbkZ7GOxxA9SIsSl4=\n-----END PUBLIC KEY-----";

module.exports = function createAPIClient (applicationToken, opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.privateKeysBaseUrl || 'https://private-keys.virgilsecurity.com/v3',

		methods: {
			stash: 'post /private-key',
			get: 'post /private-key/actions/grab',
			destroy: 'post /private-key/actions/delete',
		},

		headers: {
			'X-VIRGIL-ACCESS-TOKEN': applicationToken
		},

		transformRequest: {
			stash: stash,
			get: get,
			destroy: destroy,
		},

		body: {
			stash: ['private_key', 'virgil_card_id'],
			get: ['identity', 'response_password', 'virgil_card_id'],
			destroy: ['virgil_card_id']
		},

		required: {
			stash: ['private_key', 'virgil_card_id'],
			get: ['identity', 'response_password', 'virgil_card_id'],
			destroy: ['virgil_card_id']
		},

		errorHandler: errorHandler,
		transformResponse: transformResponse
	});

	apiClient.crypto = opts.crypto;
	apiClient.generateUUID = typeof opts.generateUUID === 'function' ? opts.generateUUID : uuid;
	apiClient.getRequestHeaders = getRequestHeaders;
	apiClient.encryptBody = encryptBody;

	return apiClient;
};

function stash (params, requestBody, opts) {
	requestBody.private_key = new Buffer(params.private_key, 'utf8').toString('base64');
	return this.encryptBody(requestBody).then(function(requestBody) {
		return this.getRequestHeaders(requestBody, params.private_key, params.private_key_password).then(function(headers) {
			opts.headers = headers;
			return [params, requestBody, opts];
		})
	});
}

function get (params, requestBody, opts) {
	return this.encryptBody(requestBody).then(function(requestBody) {
		return [params, requestBody, opts];
	});
}

function destroy (params, requestBody, opts) {
	return this.encryptBody(requestBody).then(function(requestBody) {
		return this.getRequestHeaders(requestBody, params.private_key, params.private_key_password).then(function(headers) {
			opts.headers = headers;
			return [params, requestBody, opts];
		})
	});
}

function getRequestHeaders (requestBody, privateKey, privateKeyPassword) {
	var requestUUID = this.generateUUID();
	var requestText = requestUUID + JSON.stringify(requestBody);

	return this.crypto.signAsync(requestText, privateKey, privateKeyPassword).then(function(sign) {
		return {
			'X-VIRGIL-REQUEST-SIGN': sign.toString('base64'),
			'X-VIRGIL-REQUEST-UUID': requestUUID
		}
	});
}

function encryptBody (requestBody) {
	return this.crypto.encryptAsync(JSON.stringify(requestBody), PRIVATE_KEYS_SERVICE_APP_ID, PRIVATE_KEYS_SERVICE_PUBLIC_KEY)
		.then(function(result) {
			return result.toString('base64');
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
