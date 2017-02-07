'use strict';

var test = require('tape');
var sinon = require('sinon');
var StorageMechanism = require('../../../src/shared/storage-mechanism');
var EncryptingKeyStorage = require('../../../src/key-storage/encrypting-key-storage');

function setup () {
	var storageStub = sinon.createStubInstance(StorageMechanism);
	var cryptoStub = {
		exportPrivateKey: sinon.stub(),
		importPrivateKey: sinon.stub()
	};
	var keyStorage = new EncryptingKeyStorage(storageStub, cryptoStub);

	return {
		keyStorage: keyStorage,
		storageStub: storageStub,
		cryptoStub: cryptoStub
	};
}

test('encrypt and save key', function (assert) {
	var env = setup();
	var key = {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');
	env.cryptoStub.exportPrivateKey.returns(encryptedKey);

	env.keyStorage.save(key, name, password);

	assert.true(env.storageStub.set.called);
	assert.true(env.cryptoStub.exportPrivateKey.called);

	assert.end();
});

test('load and decrypt persisted key', function (assert) {
	var env = setup();
	var key = {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	env.cryptoStub.exportPrivateKey.returns(encryptedKey);
	env.keyStorage.save(key, name, password);
	assert.true(env.storageStub.set.called);
	env.storageStub.get.returns(env.storageStub.set.getCall(0).args[1]);

	env.keyStorage.load(name, password);

	assert.true(env.storageStub.get.called);
	assert.true(encryptedKey.equals(env.cryptoStub.importPrivateKey.getCall(0).args[0]));

	assert.end();
});

test('remove persisted key', function (assert) {
	var env = setup();
	var key = {};
	var name = 'my_private_key';
	var password = '123456';
	var encryptedKey = new Buffer('encrypted key');

	env.cryptoStub.exportPrivateKey.returns(encryptedKey);
	env.keyStorage.save(key, name, password);
	assert.true(env.storageStub.set.called);

	env.keyStorage.remove(name);
	assert.true(env.storageStub.remove.called);
	assert.end();
});
