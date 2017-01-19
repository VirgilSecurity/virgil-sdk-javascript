var assert = require('../shared/utils').assert;
var isBuffer = require('../shared/utils').isBuffer;
var createSignableRequest = require('./signable-request')
	.createSignableRequest;
var importSignableRequest = require('./signable-request')
	.importSignableRequest;

/**
 * Creates and initializes a request to create Card.
 *
 * @param {Object} params - Request parameters.
 * @param {string} params.identity - Identity associated with the Card.
 * @param {string} params.identity_type - Type of identity.
 * 			Currently only 'email' or 'custom'.
 * @param {string} params.scope - The scope of the Card.
 * 			Currently only 'global' or 'application'.
 * @param {Buffer} params.public_key - Public key associated with the Card.
 * @param {Object} params.data - User data associated with the Card.
 * @param {{device: string, device_name: string}} params.info - Information on
 * 			the device associated with the Card.
 *
 * @returns {SignableRequest} - The newly created CreateCardRequest.
 * */
function createCardRequest (params) {
	params = params || {};

	var identity = params.identity;
	var	identity_type = params.identity_type;
	var	scope = params.scope || 'application';
	var	public_key = params.public_key;
	var	info = params.info || null;
	var	data = params.data || null;

	assert(identity, '"identity" parameter is required.');
	assert(identity_type, '"identity_type" parameter is required.');
	assert(scope, '"scope" parameter is required.');
	assert(['global', 'application'].indexOf(scope) > -1,
		'"scope" must be either "global" or "application"');
	assert(public_key, '"public_key" parameter is required.');
	assert(isBuffer(public_key), '"public_key" parameter must be a Buffer');

	var requestData = {
		identity: identity,
		identity_type: identity_type,
		scope: scope,
		public_key: public_key.toString('base64'),
		info: info,
		data: data
	};

	return createSignableRequest(requestData);
}

/**
 * Restores a CreateCardRequest from its serialized representation
 *
 * @returns {SignableRequest} - The restored CreateCardRequest
 * */
createCardRequest.import = importSignableRequest;

module.exports = createCardRequest;
