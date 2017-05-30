'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilKey = require('../../src/virgil-key');

function setup () {
	var storageStub = /** @type {KeyStorage} */{
		store: sinon.stub().returns(Promise.resolve()),
		load: sinon.stub(),
		delete: sinon.stub()
	};

	var cryptoStub = {
		exportPrivateKey: sinon.stub(),
		importPrivateKey: sinon.stub(),
		signThenEncrypt: sinon.stub(),
		decryptThenVerify: sinon.stub()
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
	t.true(fixture.context.keyStorage.store.called,
		'delegates saving to storage backend');

	t.end();
});

test('save key without password', function (t) {
	var fixture = setup();
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var privateKey = new Buffer('private_key');

	var virgilKey = new VirgilKey(fixture.context, keyHandle);

	fixture.context.crypto.exportPrivateKey
		.withArgs(keyHandle)
		.returns(privateKey);

	virgilKey.save(name);

	t.true(fixture.context.crypto.exportPrivateKey.called,
		'exports the key for saving');
	t.true(fixture.context.keyStorage.store.called,
		'delegates saving to storage backend');

	t.end();
});

test('sign then encrypt with multiple recipient cards', function (t) {
	var fixture = setup();
	var data = new Buffer('data to encrypt');
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var virgilKey = new VirgilKey(fixture.context, keyHandle);
	var recipientCards = [
		{ publicKey: {} },
		{ publicKey: {} }
	];
	var publicKeys = recipientCards.map(function (card) {
		return card.publicKey;
	});

	virgilKey.signThenEncrypt(data, recipientCards);

	t.true(
		fixture.context.crypto.signThenEncrypt.calledWith(data, keyHandle, publicKeys),
		'delegates to crypto provider correctly'
	);
	t.end();
});

test('sign then encrypt with empty array', function (t) {
	var fixture = setup();
	var data = new Buffer('data to encrypt');
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var virgilKey = new VirgilKey(fixture.context, keyHandle);
	var recipientCards = [];



	t.throws(
		function () {
			virgilKey.signThenEncrypt(data, recipientCards);
		},
		'throws when passed an empty array of cards'
	);
	t.end();
});

test('decrypt then verify with multiple signer cards', function (t) {
	var fixture = setup();
	var cipherData = new Buffer('enciphered data');
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var virgilKey = new VirgilKey(fixture.context, keyHandle);
	var signerCards = [
		{ publicKey: {} },
		{ publicKey: {} }
	];
	var publicKeys = signerCards.map(function (card) {
		return card.publicKey;
	});

	virgilKey.decryptThenVerify(cipherData, signerCards);

	t.true(
		fixture.context.crypto.decryptThenVerify.calledWith(cipherData, keyHandle, publicKeys),
		'delegates to crypto provider correctly'
	);
	t.end();
});

test('decrypt then verify with empty array', function (t) {
	var fixture = setup();
	var cipherData = new Buffer('enciphered data');
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var virgilKey = new VirgilKey(fixture.context, keyHandle);
	var signerCards = [];

	t.throws(
		function () {
			virgilKey.decryptThenVerify(cipherData, signerCards);
		},
		'throws when passed an empty array of cards'
	);
	t.end();
});

test('returns this key instance on save', function (t) {
	var fixture = setup();
	var keyHandle = /** @type {CryptoKeyHandle} */ {};
	var name = 'my_private_key';
	var privateKey = new Buffer('private_key');

	var virgilKey = new VirgilKey(fixture.context, keyHandle);

	fixture.context.crypto.exportPrivateKey
		.withArgs(keyHandle)
		.returns(privateKey);

	virgilKey.save(name)
		.then(function (result) {
			t.ok(result === virgilKey, 'resolves with the instance on save');
			t.end();
		});
});
