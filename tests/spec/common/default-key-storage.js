'use strict';

var test = require('tape');
var sinon = require('sinon');
var defaultKeyStorage = require('../../../src/key-storage/default-key-storage');

function setup () {
	var storageStub = /** @type {StorageAdapter} */{
		save: sinon.stub(),
		load: sinon.stub(),
		remove: sinon.stub()
	};

	var cryptoStub = {
		exportPrivateKey: sinon.stub(),
		importPrivateKey: sinon.stub()
	};

	var keyStorage = defaultKeyStorage(storageStub, cryptoStub);

	return {
		keyStorage: keyStorage,
		storageStub: storageStub,
		cryptoStub: cryptoStub
	};
}

test('encrypt and save key', function (t) {
	var fixture = setup();
	var key = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');
	fixture.cryptoStub.exportPrivateKey.returns(encryptedKey);

	fixture.keyStorage.store(name, key, password);

	t.true(fixture.storageStub.save.called,
		'delegates saving to storage backend');
	t.true(fixture.cryptoStub.exportPrivateKey.called,
		'exports the key for saving');

	t.end();
});

test('load and decrypt persisted key', function (t) {
	var fixture = setup();
	var key = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	fixture.cryptoStub.exportPrivateKey.returns(encryptedKey);
	fixture.keyStorage.store(name, key, password);

	fixture.storageStub.load.returns(
		Promise.resolve(fixture.storageStub.save.getCall(0).args[1]));

	fixture.keyStorage.load(name, password)
		.then(function () {
			t.true(fixture.storageStub.load.called,
				'gets the stored key from backend');
			t.true(encryptedKey.equals(
				fixture.cryptoStub.importPrivateKey.getCall(0).args[0]),
				'imports the key before returning');

			t.end();
		});
});

test('remove persisted key', function (t) {
	var fixture = setup();
	var key = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	fixture.cryptoStub.exportPrivateKey.returns(encryptedKey);
	fixture.keyStorage.store(name, key, password);

	fixture.keyStorage.remove(name);
	t.true(fixture.storageStub.remove.called,
		'delegates removal to the backend');
	t.end();
});
