var test = require('tape');

var CardScope = require('../../src/client/card-scope');
var publishCardRequest = require('../../src/client/publish-card-request');

test('publish request parameters validation', function (t) {
	function tryCreateWithoutIdentity  () {
		var parameters = {
			identity_type: 'username',
			scope: CardScope.APPLICATION,
			public_key: 'xxx'
		};

		return publishCardRequest(parameters);
	}

	function tryCreateWithoutPublicKey () {
		var parameters = {
			identity: 'user123',
			identity_type: 'username',
			scope: CardScope.APPLICATION
		};

		return publishCardRequest(parameters);
	}

	function tryCreateWithoutIdentityType () {
		var parameters = {
			identity: 'user123',
			scope: CardScope.APPLICATION,
			public_key: 'xxx'
		};

		return publishCardRequest(parameters);
	}

	function tryCreateWithInvalidScope () {
		var parameters = {
			identity: 'user123',
			identity_type: 'username',
			scope: 'not_a_valid_scope',
			public_key: 'xxx'
		};

		return publishCardRequest(parameters);
	}

	t.throws(tryCreateWithoutIdentity, /"identity"/,
		'Should not create request without identity');
	t.throws(tryCreateWithoutIdentityType, /"identity_type"/,
		'Should not create request without identity type');
	t.throws(tryCreateWithoutPublicKey, /"public_key"/,
		'Should not create request without public key');
	t.throws(tryCreateWithInvalidScope, /"scope"/,
		'Should not create request with invalid scope');
	t.end();
});
