var assert = require('../shared/utils').assert;
var createSignableRequest = require('./signable-request')
	.createSignableRequest;
var importSignableRequest = require('./signable-request')
	.importSignableRequest;

/**
 * Creates and initializes a request to revoke Card.
 *
 * @param {Object} params - Request parameters.
 * @param {string} params.card_id - Id of card to revoke.
 * @param {RevocationReason} params.revocation_reason - Reason behind
 * 			revoking the card.
 *
 * @returns {SignableRequest} - The newly created RevokeCardRequest.
 * */
function cardRevokeRequest(params) {
	params = params || {};
	var card_id = params.card_id;
	var	revocation_reason = params.revocation_reason || 'unspecified';

	assert(card_id, '"card_id" parameter is required.');
	assert(revocation_reason, '"revocation_reason" parameter is required.');
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
 * @returns {SignableRequest} - The restored RevokeCardRequest.
 * */
cardRevokeRequest.import = importSignableRequest;

module.exports = cardRevokeRequest;
