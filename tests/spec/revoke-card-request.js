var test = require('tape');

var RevocationReason = require('../../src/client/card-revocation-reason');
var revokeCardRequest = require('../../src/client/revoke-card-request');

test('revoke request parameters validation', function (t) {
	function tryCreateWithoutCardId  () {
		var parameters = {
			revocation_reason: RevocationReason.COMPROMISED
		};

		return revokeCardRequest(parameters);
	}

	function tryCreateWithInvalidReason () {
		var parameters = {
			card_id: 'card123',
			revocation_reason: 'not_a_valid_reason'
		};

		return revokeCardRequest(parameters);
	}

	t.throws(tryCreateWithoutCardId, /"card_id"/,
		'Should not create request without card_id');
	t.throws(tryCreateWithInvalidReason, /"revocation_reason"/,
		'Should not create request with invalid scope');
	t.end();
});
