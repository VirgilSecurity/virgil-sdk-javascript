import { assert } from '../utils/utils';
import { signableRequest, signableRequestFromTransferFormat } from './signable-request';

/**
 * Creates and initializes a request to revoke Card
 *
 * @param {Object} params - Request parameters
 * @param {string} params.card_id - Id of card to revoke
 * @param {string} params.revocation_reason - Reason behind revoking the card
 *
 * @returns {Object} - Revoke Card Request
 * */
export function cardRevokeRequest(params) {
	const { card_id, revocation_reason = 'unspecified' } = params;

	assert(card_id, '"card_id" parameter is required.');
	assert(revocation_reason, '"revocation_reason" parameter is required.');
	assert(['unspecified', 'compromised'].indexOf(revocation_reason) > -1,
		'"revocation_reason" must be either "unspecified" or "compromised"');

	return Object.create(signableRequest({ card_id, revocation_reason }));
}

/**
 * Restores a request from its serialized representation
 *
 * @returns {Object} - Revoke Card Request
 * */
cardRevokeRequest.fromTransferFormat = signableRequestFromTransferFormat.bind(cardRevokeRequest);
