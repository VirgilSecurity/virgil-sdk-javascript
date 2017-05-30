var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../src/virgil');

var appCardId = virgilConfig.appCardId;
var appPrivateKey = virgil.crypto.importPrivateKey(
	virgilConfig.appPrivateKey,
	virgilConfig.appPrivateKeyPassword);

var client = virgil.client(virgilConfig.accessToken, virgilConfig);

var alicePrivateKey, bobPrivateKey, aliceCardId, bobCardId;

test('setup alice', function (t) {
	var keyPair = virgil.crypto.generateKeys();
	var rawPublicKey = virgil.crypto.exportPublicKey(keyPair.publicKey);
	var username = 'alice_test_sdk';

	var publishCardRequest = virgil.publishCardRequest({
		identity: username,
		identity_type: 'username',
		public_key: rawPublicKey.toString('base64')
	});

	var requestSigner = virgil.requestSigner(virgil.crypto);
	requestSigner.selfSign(publishCardRequest, keyPair.privateKey);
	requestSigner.authoritySign(publishCardRequest, appCardId, appPrivateKey);

	client.publishCard(publishCardRequest)
		.then(function (card) {
			t.ok(card, 'Alice\'s card has been created');
			alicePrivateKey = virgil.crypto.exportPrivateKey(keyPair.privateKey);
			aliceCardId = card.id;
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});
});

test('setup bob', function (t) {
	var keyPair = virgil.crypto.generateKeys();
	var rawPublicKey = virgil.crypto.exportPublicKey(keyPair.publicKey);
	var username = 'bob_test_sdk';

	var publishCardRequest = virgil.publishCardRequest({
		identity: username,
		identity_type: 'username',
		public_key: rawPublicKey.toString('base64')
	});

	var requestSigner = virgil.requestSigner(virgil.crypto);
	requestSigner.selfSign(publishCardRequest, keyPair.privateKey);
	requestSigner.authoritySign(publishCardRequest, appCardId, appPrivateKey);

	client.publishCard(publishCardRequest)
		.then(function (card) {
			t.ok(card, 'Bob\'s card has been created');
			bobPrivateKey = virgil.crypto.exportPrivateKey(keyPair.privateKey);
			bobCardId = card.id;
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});
});

var messageToBob;

test('alice encrypt message for bob', function (t) {

	findBob()
		.tap(function assertBobIsFound(card) {
			if (card == null) {
				t.fail('Bob\'s card was not found.');
			}
		})
		.then(encryptMessageForBob)
		.tap(function assertMessageEncrypted(msg) {
			if (!Buffer.isBuffer(msg)) {
				t.fail('Encrypted message is not a Buffer.');
			}
		})
		.then(function (msg) {
			messageToBob = msg;
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});

	function findBob() {
		return client.searchCards({
			identities: [ 'bob_test_sdk' ],
			identity_type: 'username',
			scope: 'application'
		});
	}

	function encryptMessageForBob(bobCards) {
		var plainText = 'hello Bob! This is my secret message.';
		var publicKeys = bobCards.map(function (bobCard) {
			return virgil.crypto.importPublicKey(bobCard.publicKey);
		});
		var cipherText = virgil.crypto.encrypt(plainText, publicKeys);
		return cipherText;
	}
});

test('bob decrypt', function (t) {
	var privateKey = virgil.crypto.importPrivateKey(bobPrivateKey);
	var plainText = virgil.crypto.decrypt(messageToBob, privateKey);
	t.equal(plainText.toString('utf8'),
		'hello Bob! This is my secret message.',
		'decrypted and plain texts are the same.');
	t.end();
});

var aliceSignature;
test('alice sign', function (t) {
	var privateKey = virgil.crypto.importPrivateKey(alicePrivateKey);
	var signedData = 'Sign me, please';
	aliceSignature = virgil.crypto.sign(signedData, privateKey);
	t.ok(Buffer.isBuffer(aliceSignature), 'Signature returned as Buffer.');
	t.end();
});

test('bob verify', function (t) {
	findAlice()
		.tap(function (card) {
			if (card == null) {
				t.fail('Alice\'s card was not found.');
			}
		})
		.then(verifyAliceSignature)
		.tap(function (isVerified) {
			if (!isVerified) {
				t.fail('Signature not verified.');
			}
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});

	function findAlice() {
		return client.searchCards({
			identities: [ 'alice_test_sdk' ],
			identity_type: 'username',
			scope: 'application'
		}).then(function (cards) {
			return cards.find(function (card) {
				return card.id === aliceCardId;
			});
		});
	}

	function verifyAliceSignature(aliceCard) {
		var pubkey = virgil.crypto.importPublicKey(aliceCard.publicKey);
		var signedData = 'Sign me, please';
		return virgil.crypto.verify(signedData, aliceSignature, pubkey);
	}
});

test('cleanup alice', function (t) {
	var cardRevokeRequest = virgil.revokeCardRequest({
		card_id: aliceCardId
	});
	var signer = virgil.requestSigner(virgil.crypto);

	signer.authoritySign(cardRevokeRequest, appCardId, appPrivateKey);
	client.revokeCard(cardRevokeRequest)
		.then(function (res) {
			t.ok(res, 'Card revoked');
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});
});

test('cleanup bob', function (t) {
	var cardRevokeRequest = virgil.revokeCardRequest({
		card_id: bobCardId
	});
	var signer = virgil.requestSigner(virgil.crypto);

	signer.authoritySign(cardRevokeRequest, appCardId, appPrivateKey);
	client.revokeCard(cardRevokeRequest)
		.then(function (res) {
			t.ok(res, 'Card revoked');
			t.end();
		}).catch(function (err) {
			t.fail(err.message);
		});
});
