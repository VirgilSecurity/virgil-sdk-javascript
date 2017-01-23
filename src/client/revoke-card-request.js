'use strict';

var assert = require('../shared/utils').assert;
var createSignableRequest = require('./signable-request')
	.createSignableRequest;
var importSignableRequest = require('./signable-request')
	.importSignableRequest;

/**
 * @classdesc Represents a request to revoke a Virgil Card from the
 * Virgil Cards Service.
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
 * @param {Object} params - Request parameters.
 * @param {string} params.card_id - Id of the card to revoke.
 * @param {RevocationReason} [params.revocation_reason='unspecified'] -
 * 			Optional reason for revoking the card.
 * 			Default is 'unspecified'.
 *
 * @returns {RevocationReason} - The newly created RevokeCardRequest.
 * */
function cardRevokeRequest(params) {
	params = params || {};
	var card_id = params.card_id;
	var	revocation_reason = params.revocation_reason || 'unspecified';

	assert(card_id, '"card_id" parameter is required.');
	assert(['unspecified', 'compromised'].indexOf(revocation_reason) > -1,
		'"revocation_reason" must be either "unspecified" or "compromised"');

	return createSignableRequest({
		card_id: card_id,
		revocation_reason: revocation_reason
	});
}

/**
 * Restores a RevokeCardRequest from its serialized representation.
 *
 * @returns {RevokeCardRequest} - The restored RevokeCardRequest.
 * */
cardRevokeRequest.import = importSignableRequest;

module.exports = cardRevokeRequest;
