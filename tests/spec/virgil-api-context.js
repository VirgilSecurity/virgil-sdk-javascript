'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilAPIContext = require('../../src/virgil-api-context');

function setup () {
	var storageStub = /** @type {KeyStorage} */{
		store: sinon.stub(),
		load: sinon.stub(),
		delete: sinon.stub()
	};

	var cryptoStub = {
		exportPrivateKey: sinon.stub(),
		importPrivateKey: sinon.stub()
	};

	var context = {
		crypto: cryptoStub,
		keyStorage: storageStub
	};

	return {
		context: context
	};
}

test('default configuration', function (t) {
	var context = new VirgilAPIContext();

	t.equal(context._config.keyStoragePath, './VirgilSecurityKeys',
		'sets default key storage path');
	t.equal(context._config.keyStorageName, 'VirgilSecurityKeys',
		'sets default key storage name');
	t.equal(context._config.useBuiltInVerifiers, true,
		'using built-in card verifiers by default');

	t.ok(context.client, 'client is defined');
	t.equal(context.credentials, null,
		'credentials is null if not provided in config');
	t.ok(context.crypto, 'crypto is defined');
	t.ok(context.keyStorage, 'keyStorage is defined');
	t.equal(context.defaultKeyPairType, null, 'defaultKeyPairType is null');
	t.end();
});


test('custom configuration', function (t) {
	var config = {
		crypto: {},
		keyStorage: {},
		defaultKeyPairType: 'EC_BP256R1',
		useBuiltInVerifiers: false
	};

	var context = new VirgilAPIContext(config);

	t.equal(context._config.useBuiltInVerifiers, false,
		'useBuiltInVerifiers is overwritten');
	t.equal(context.crypto, config.crypto, 'returns custom crypto');
	t.equal(context.keyStorage, config.keyStorage, 'returns custom keyStorage');
	t.equal(context.defaultKeyPairType, config.defaultKeyPairType,
		'returns custom defaultKeyPairType');
	t.end();
});
