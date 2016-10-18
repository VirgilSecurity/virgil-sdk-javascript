var assert = require('../utils/utils').assert;
var signableRequest = require('./signable-request').signableRequest;
var signableRequestFromTransferFormat = require('./signable-request').signableRequestFromTransferFormat;

/**
 * Creates and initializes a request to create Card
 *
 * @param {Object} params - Request parameters
 * @param {string} params.identity - Identity associated with the Card
 * @param {string} params.identity_type - Type of identity ('email' or 'custom')
 * @param {string} params.scope - The scope of the Card ('global' or 'application')
 * @param {Buffer} params.public_key - Public key associated with the Card
 * @param {Object} params.data - User data associated with the Card
 * @param {{device: string, device_name: string}} params.info - Information on the device associated with the Card
 *
 * @returns {Object} - Create Card Request
 * */
function cardRequest (params) {
	params = params || {};
	var identity = params.identity,
		identity_type = params.identity_type,
		scope = params.scope || 'application',
		public_key = params.public_key,
		info = params.info ? Object.assign({}, params.info) : null,
		data = params.data ? Object.assign({}, params.data) : null;

	assert(identity, '"identity" parameter is required.');
	assert(identity_type, '"identity_type" parameter is required.');
	assert(scope, '"scope" parameter is required.');
	assert(['global', 'application'].indexOf(scope) > -1, '"scope" must be either "global" or "application"');
	assert(public_key, '"public_key" parameter is required.');
	assert(Buffer.isBuffer(public_key), '"public_key" parameter must be a Buffer');

	var requestData = {
		identity: identity,
		identity_type: identity_type,
		scope: scope,
		public_key: public_key,
		info: info,
		data: data
	};

	return Object.create(signableRequest(requestData));
}

/**
 * Restores a request from its serialized representation
 *
 * @returns {Object} - Create Card Request
 * */
cardRequest.fromTransferFormat = signableRequestFromTransferFormat.bind(cardRequest);

module.exports = cardRequest;
