'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilKey = require('../../src/virgil-key');

function setup () {
	var storageStub = /** @type {KeyStorage} */{
		save: sinon.stub(),
		load: sinon.stub(),
		remove: sinon.stub()
	};

	var cryptoStub = {
		exportPrivateKey: sinon.stub(),
		importPrivateKey: sinon.stub()
	};

	var context = /** @type {VirgilAPIContext} */{
		crypto: cryptoStub,
		keyStorage: storageStub
	};

	return {
		context: context
	};
}

test('encrypt and save key', function (t) {
	var fixture = setup();
	var key = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	var virgilKey = new VirgilKey(fixture.context, key);

	fixture.context.crypto.exportPrivateKey
		.withArgs(key, password)
		.returns(encryptedKey);

	virgilKey.save(name, password);

	t.true(fixture.context.crypto.exportPrivateKey.called,
		'exports the key for saving');
	t.true(fixture.context.keyStorage.save.called,
		'delegates saving to storage backend');

	t.end();
});
