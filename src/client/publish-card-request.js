'use strict';

var assert = require('../shared/utils').assert;
var isString = require('../shared/utils').isString;
var isEmpty = require('../shared/utils').isEmpty;
var isObject = require('../shared/utils').isObject;
var SignableRequest = require('./signable-request');
var CardScope = require('./card-scope');

/**
 * @typedef {Object} CardDeviceInfo
 *
 * @property {string} [device] - Optional device identifier.
 * @property {string} [device_name] - Optional device name.
 * */

/**
 * @typedef  {Object} PublishCardRequestParams
 * @property {string} identity - Identity associated with the Card.
 * @property {(IdentityType|string)} identity_type - Type of identity of the
 * 			card. For Global Cards the only types supported are 'email' and
 * 			'application'. For Application Cards it can be any string.
 * @property {string} public_key - Public key associated with the Card
 * 			as a string encoded in base64.
 * @property {CardScope} [scope='application'] - Optional scope of the Card.
 * 			Default is 'application'.
 * @property {Object.<string, string>} [data] - Optional user data associated
 * 			with the Card.
 * @property {CardDeviceInfo} [info] - Optional information about the device the card
 * 			is associated with.
 * */

/**
 * @classdesc Represents a request to publish a Virgil Card to the
 * Virgil Cards Service.
 *
 * <code>PublishCardRequest</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>publishCardRequest()</code>
 * factory function to create an instance.
 *
 * @example
 *
 * var request = virgil.publishCardRequest({ identity: 'bob' });
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
 * @property {Object} [data] - Optional user data associated with the card
 * 			to be published.
 * @property {Object} [info] - Optional information about the device the card
 * 			is associated with.
 * @property {string} [info.device] - Optional type\model of the device
 * 			associated with the card.
 * @property {string} [info.device_name] - Optional name of the device
 * 			associated with the card.


/**
 * Creates and initializes a request to create Card.
 *
 * @param {PublishCardRequestParams} params - Request parameters.
 * @param {string} [validationToken] - Optional card's identity validation
 *		token. Required when publishing cards with 'global' scope.
 * @returns {PublishCardRequest}
 * */
function publishCardRequest (params, validationToken) {
	assert(isObject(params),
		'publishCardRequest expects request params to be passed as an ' +
		'object. Got ' + typeof params);

	var identity = params.identity;
	var	identity_type = params.identity_type;
	var	scope = params.scope || CardScope.APPLICATION;
	var	public_key = params.public_key;
	var	info = params.info || null;
	var	data = params.data || null;

	assert(isString(identity) && !isEmpty(identity),
		'publishCardRequest expects identity parameter to be passed as ' +
		'a string. Got ' + typeof identity);
	assert(isString(identity_type) && !isEmpty(identity_type),
		'publishCardRequest expects identity_type parameter to be passed as ' +
		'a string. Got ' + typeof identity_type);
	assert(isString(public_key) && !isEmpty(public_key),
		'publishCardRequest expects public_key parameter to be passed as ' +
		'a string. Got ' + typeof public_key);
	assert(isString(scope) && ['global', 'application'].indexOf(scope) > -1,
		'publishCardRequest expects scope parameter to be either "global" ' +
		'or "application".');

	if (scope === CardScope.GLOBAL) {
		assert(isString(validationToken) && !isEmpty(validationToken),
			'publishCardRequest expects validation token to be passed if the ' +
			'scope parameter is "global"');
	}

	var requestData = {
		identity: identity,
		identity_type: identity_type,
		scope: scope,
		public_key: public_key,
		info: info,
		data: data
	};

	return /** @type {PublishCardRequest} */ SignableRequest.create(
		requestData, validationToken);
}

/**
 * Restores a publish card request from its serialized representation.
 *
 * @returns {PublishCardRequest}
 * */
publishCardRequest.import = SignableRequest.import;

module.exports = publishCardRequest;
