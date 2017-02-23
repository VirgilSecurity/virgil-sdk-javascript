'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilKey = require('../../src/virgil-key');
var createKeyManager = require('../../src/key-manager');

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

	t.true(fixture.context.keyStorage.delete.called,
		'delegates removal to the backend');
	t.end();
});

test('import key without password', function (t) {
	var fixture = setup();
	var keyMaterial = 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3Ql' +
		'FZREsyVndCQ0lFSUhVbURlb1RkRUNDWFVUU2VEaDVRYkZpZCtWcFFUeDBpWHl1dm' +
		'djYkhOT1EKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQo=';

	var manager = createKeyManager(fixture.context);

	var key = manager.import(keyMaterial);
	t.ok(key, 'imports key without password');
	t.ok(fixture.context.crypto.importPrivateKey.calledWith(keyMaterial),
		'passes correct args to crypto');
	t.end();
});

test('import key with password', function (t) {
	var fixture = setup();

	var keyMaterial = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNS' +
		'UdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJCQkhsejNL' +
		'MFg0MVZwRkFPbzhxCjFSTWtBZ0lQMnpBS0JnZ3Foa2lHOXcwQ0NqQWRCZ2xnaGtnQlp' +
		'RTUVBU29FRVBCeEE3MWxuczZVNzdHa2xXaW8KM0QwRVFPbDZyVVA5MTFCcnNIdjhWUk' +
		'MwQzhGOWM4SGNBc1czOG43SDZZTFp3aVZzLy84NnpXeUtjNWNQclhsVgoxS2lWWThzc' +
		'HRzcWNhTmlrVEdVdEZtcEV3WTQ9Ci0tLS0tRU5EIEVOQ1JZUFRFRCBQUklWQVRFIEtF' +
		'WS0tLS0tCg==';
	var password = 'mypassword';

	var manager = createKeyManager(fixture.context);

	var key = manager.import(keyMaterial, password);
	t.ok(key, 'imports key with password');
	t.ok(fixture.context.crypto.importPrivateKey
			.calledWith(keyMaterial, password),
		'passes correct args to crypto');
	t.end();
});

