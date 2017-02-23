var test = require('tape');

var RevocationReason = require('../../src/client/card-revocation-reason');
var revokeCardRequest = require('../../src/client/revoke-card-request');
var VirgilError = require('../../src/errors/virgil-error');

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

	function tryCreateWithEmptyCardId () {
		var parameters = {
			card_id: ''
		};
		return revokeCardRequest(parameters);
	}

	t.throws(tryCreateWithoutCardId, VirgilError,
		'throws when not passed the card_id');
	t.throws(tryCreateWithInvalidReason, VirgilError,
		'throws when passed invalid reason');
	t.throws(tryCreateWithEmptyCardId, VirgilError,
		'throws when passed empty card id');
	t.end();
});

test('create revoke request with string argument', function (t) {
	var cardId = 'abc123';
	var request = revokeCardRequest(cardId);
	t.equal(request.card_id, cardId,
		'creates request when passed just the card id as a string');
	t.equal(request.revocation_reason, RevocationReason.UNSPECIFIED,
		'sets default reason when passed just the card id as a string');
	t.end();
});
