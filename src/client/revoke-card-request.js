var assert = require('../utils/utils').assert;
var signableRequest = require('./signable-request').signableRequest;
var signableRequestImport = require('./signable-request').signableRequestImport;

/**
 * Creates and initializes a request to revoke Card
 *
 * @param {Object} params - Request parameters
 * @param {string} params.card_id - Id of card to revoke
 * @param {string} params.revocation_reason - Reason behind revoking the card
 *
 * @returns {Object} - Revoke Card Request
 * */
function cardRevokeRequest(params) {
	params = params || {};
	var card_id = params.card_id,
		revocation_reason = params.revocation_reason || 'unspecified';

	assert(card_id, '"card_id" parameter is required.');
	assert(revocation_reason, '"revocation_reason" parameter is required.');
	assert(['unspecified', 'compromised'].indexOf(revocation_reason) > -1,
		'"revocation_reason" must be either "unspecified" or "compromised"');

	return signableRequest({ card_id: card_id, revocation_reason: revocation_reason });
}

/**
 * Restores a request from its serialized representation
 *
 * @returns {Object} - Revoke Card Request
 * */
cardRevokeRequest.import = signableRequestImport;

module.exports = cardRevokeRequest;
