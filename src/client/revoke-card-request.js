'use strict';

var assert = require('../shared/utils').assert;
var isString = require('../shared/utils').isString;
var isEmpty = require('../shared/utils').isEmpty;
var isObject = require('../shared/utils').isObject;
var SignableRequest = require('./signable-request');
var RevocationReason = require('./card-revocation-reason');

/**
 * @typedef {Object} RevokeCardRequestParameters
 * @property {string} card_id - Id of the card to revoke.
 * @property {RevocationReason} [revocation_reason='unspecified'] -
 * 			Optional reason for revoking the card.
 * 			Default is 'unspecified'.
 * */

/**
 * @classdesc Represents a request to revoke a Virgil Card from the
 * Virgil Cards Service.
 *
 * <code>RevokeCardRequest</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>revokeCardRequest()</code>
 * factory function to create an instance.
 *
 * @example
 *
 * var request = virgil.revokeCardRequest({ card_id: '123' });
 *
 * @class
 * @name RevokeCardRequest
 * @augments SignableRequest
 * @property {string} card_id - Id of the card to revoke.
 * @property {string} revocation_reason - The reason for card
 * 			revocation.
 * */


/**
 * Creates and initializes a request to revoke a Virgil Card.
 *
 * @param {(RevokeCardRequestParameters|string)} params - Request parameters
 * 		object or the card id as a string.
 * @param {string} [validationToken] - Optional card's identity validation
 * 		token. Required when revoking cards with 'global' scope.
 * @returns {RevokeCardRequest}
 * */
function revokeCardRequest(params, validationToken) {
	assert(isObject(params) || isString(params),
		'revokeCardRequest expects request params to be passed as an object ' +
		'or a string. Got ' + typeof params);

	if (isString(params)) {
		params = {
			card_id: params
		};
	}

	var card_id = params.card_id;
	var	revocation_reason = params.revocation_reason ||
		RevocationReason.UNSPECIFIED;

	assert(isString(card_id) && !isEmpty(card_id),
		'revokeCardRequest expects card_id parameter to be passed as a ' +
		'string. Got ' + typeof card_id);

	assert(isString(revocation_reason) &&
		['unspecified', 'compromised'].indexOf(revocation_reason) > -1,
		'revokeCardRequest expects revocation_reason parameter to be ' +
		'either "unspecified" or "compromised".');

	return /** @type {RevokeCardRequest} */ SignableRequest.create({
		card_id: card_id,
		revocation_reason: revocation_reason
	}, validationToken);
}

/**
 * Restores a revoke card request from its serialized representation.
 *
 * @returns {RevokeCardRequest}
 * */
revokeCardRequest.import = SignableRequest.import;

module.exports = revokeCardRequest;
