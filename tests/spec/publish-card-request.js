var test = require('tape');

var CardScope = require('../../src/client/card-scope');
var publishCardRequest = require('../../src/client/publish-card-request');
var VirgilError = require('../../src/errors/virgil-error');

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

	function tryCreateWithEmptyIdentity () {
		var parameters = {
			identity: '',
			identity_type: 'username',
			scope: CardScope.APPLICATION,
			public_key: 'xxx'
		};

		return publishCardRequest(parameters);
	}

	function tryCreateWithEmptyIdentityType () {
		var parameters = {
			identity: 'username@example.com',
			identity_type: '',
			scope: CardScope.APPLICATION,
			public_key: 'xxx'
		};

		return publishCardRequest(parameters);
	}

	function tryCreateWithEmptyPublicKey () {
		var parameters = {
			identity: 'username@example.com',
			identity_type: 'username',
			scope: CardScope.APPLICATION,
			public_key: ''
		};

		return publishCardRequest(parameters);
	}

	t.throws(tryCreateWithoutIdentity, VirgilError,
		'throws when not passed an identity');
	t.throws(tryCreateWithoutIdentityType, VirgilError,
		'throws when not passed an identity type');
	t.throws(tryCreateWithoutPublicKey, VirgilError,
		'throws when not passed a public key');
	t.throws(tryCreateWithInvalidScope, VirgilError,
		'throws when passed an invalid scope');
	t.throws(tryCreateWithEmptyIdentity, VirgilError,
		'throws when passed an empty identity');
	t.throws(tryCreateWithEmptyPublicKey, VirgilError,
		'throws when passed an empty public key');
	t.end();
});

test('publish request defaults', function (t) {
	var parameters = {
		identity: 'username@example.com',
		identity_type: 'username',
		public_key: 'xxx'
	};

	var request = publishCardRequest(parameters);
	t.equal(request.identity, parameters.identity, 'sets identity correctly');
	t.equal(request.identity_type, parameters.identity_type,
		'sets identity type correctly');
	t.equal(request.scope, CardScope.APPLICATION,
		'sets default scope to "application');
	t.end();
});
