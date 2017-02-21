'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilKey = require('../../src/virgil-key');
var createKeyManager = require('../../src/key-manager');

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

test('load and decrypt persisted key', function (t) {
	var fixture = setup();
	var key = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	var manager = createKeyManager(fixture.context);

	fixture.context.keyStorage.load
		.withArgs(name)
		.returns(Promise.resolve(encryptedKey));

	fixture.context.crypto.importPrivateKey
		.withArgs(encryptedKey, password)
		.returns(key);

	manager.load(name, password)
		.then(function (loadedKey) {
			t.true(fixture.context.keyStorage.load.called,
				'gets the stored key from backend');

			t.true(fixture.context.crypto.importPrivateKey.called,
				'imports the key material');

			t.ok(loadedKey instanceof VirgilKey,
				'returns stored key as VirgilKey');

			t.end();
		});
});

test('remove persisted key', function (t) {
	var fixture = setup();
	var name = 'my_private_key';

	var manager = createKeyManager(fixture.context);
	manager.destroy(name);

	t.true(fixture.context.keyStorage.remove.called,
		'delegates removal to the backend');
	t.end();
});
