'use strict';

var assert = require('../shared/utils').assert;
var createSignableRequest = require('./signable-request')
	.createSignableRequest;
var importSignableRequest = require('./signable-request')
	.importSignableRequest;

/**
 * @classdesc Represents a request to publish a Virgil Card to the
 * Virgil Cards Service.
 *
 * @class
 * @name PublishCardRequest
 * @augments SignableRequest
 * @property {string} identity - The identity of the card to be published.
 * @property {string} identity_type - The identity type of the card to be
 * 			published.
 * @property {string} scope - The scope of the card to be published.
 * @property {string} public_key - The public key of the card to be published
 * 			as a base64-encoded string.
 * @property {Object.<*>} [data] - Optional user data associated with the card
 * 			to be published.
 * @property {Object} [info} - Optional information about the device the card
 * 			is associated with.
 * @property {string} [info.device] - Optional type\model of the device
 * 			associated with the card.
 * @property {string} [info.device_name] - Optional name of the device
 * 			associated with the card.
 *
 * */

/**
 * Creates and initializes a request to create Card.
 *
 * @param {Object} params - Request parameters.
 * @param {string} params.identity - Identity associated with the Card.
 * @param {(IdentityType|string)} params.identity_type - Type of identity.
 * 			For Global Cards the only types supported are 'email' and
 * 			'application'. For Application Cards it can be any string.
 * @param {CardScope} params.scope - The scope of the Card.
 * @param {string} params.public_key - Public key associated with the Card
 * 			as a base64-encoded string.
 * @param {Object.<*>} [params.data] - Optional user data associated with the Card.
 * @param {Object} [params.info} - Optional information about the device the card
 * 			is associated with.
 * @param {string} [params.info.device] - Optional type\model of the device
 * 			associated with the card.
 * @param {string} [params.info.device_name] - Optional name of the device
 * 			associated with the card.
 *
 * @returns {PublishCardRequest} - The newly created PublishCardRequest.
 * */
function publishCardRequest (params) {
	params = params || {};

	var identity = params.identity;
	var	identity_type = params.identity_type;
	var	scope = params.scope || 'application';
	var	public_key = params.public_key;
	var	info = params.info || null;
	var	data = params.data || null;

	assert(identity, '"identity" parameter is required.');
	assert(identity_type, '"identity_type" parameter is required.');
	assert(public_key, '"public_key" parameter is required.');
	assert(['global', 'application'].indexOf(scope) > -1,
		'"scope" must be either "global" or "application"');

	var requestData = {
		identity: identity,
		identity_type: identity_type,
		scope: scope,
		public_key: public_key,
		info: info,
		data: data
	};

	return createSignableRequest(requestData);
}

/**
 * Restores a PublishCardRequest from its serialized representation.
 *
 * @returns {PublishCardRequest} - The restored PublishCardRequest.
 * */
publishCardRequest.import = importSignableRequest;

module.exports = publishCardRequest;
