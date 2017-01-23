var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../');

var appCardId = virgilConfig.appCardId;
var appPrivateKey = virgil.crypto.importPrivateKey(
	new Buffer(virgilConfig.appPrivateKey, 'base64'),
	virgilConfig.appPrivateKeyPassword);

var client = virgil.client(virgilConfig.accessToken, virgilConfig);

var alicePrivateKey, bobPrivateKey, aliceCardId, bobCardId;

test('virgil cards flow', function testVerify (t) {
	var createdCard;
	var keyPair = virgil.crypto.generateKeys();

	createCard()
		.tap(assertPublishResponse)
		.then(get)
		.tap(assertGet)
		.then(search)
		.tap(assertSearch)
		.then(searchGlobal)
		.tap(assertSearchGlobal)
		.then(revokeCard)
		.tap(assertRevokeCard)
		.catch(console.error);

	function createCard() {
		var rawPublicKey = virgil.crypto.exportPublicKey(keyPair.publicKey);
		var username = 'testjssdk' + Math.random();

		var publishCardRequest = virgil.publishCardRequest({
			identity: username,
			identity_type: 'username',
			public_key: rawPublicKey.toString('base64')
		});

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.selfSign(publishCardRequest, keyPair.privateKey);
		requestSigner.authoritySign(publishCardRequest, appCardId, appPrivateKey);

		return client.publishCard(publishCardRequest)
			.then(function (card) {
				createdCard = card;
				return card;
			});
	}

	function assertPublishResponse (res) {
		logResponse('client#publishCard', res);
		t.ok(res, 'card is published');
		t.ok(Object.keys(res.signatures).length === 3, 'service signature appended');
	}

	function get(card) {
		return client.getCard(card.id);
	}

	function assertGet(res) {
		logResponse('client#getCard', res);
		t.ok(res, 'returns single card');
	}

	function search (card) {
		return client.searchCards({
			identities: [card.identity],
			identity_type: card.identityType
		});
	}

	function assertSearch (res) {
		logResponse('client#searchCards', res);
		t.ok(res.length > 0, 'card is found');
	}

	function searchGlobal () {
		return client.searchCards({
			identities: [ 'com.virgil-test.integration-tests' ],
			identity_type: 'application',
			scope: 'global'
		});
	}

	function assertSearchGlobal (res) {
		logResponse('client#searchCards (scope: "global")', res);
		t.ok(res.length > 0, 'global cards found');
	}

	function revokeCard () {
		var revokeRequest = virgil.revokeCardRequest({
			card_id: createdCard.id,
			revocation_reason: 'unspecified'
		});

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.authoritySign(revokeRequest, appCardId, appPrivateKey);

		return client.revokeCard(revokeRequest);
	}

	function assertRevokeCard (res) {
		logResponse('client#revokeCard', res);
		t.end();
	}
});

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
			t.ok(card !== null, 'Bob\'s card was found.');
		})
		.then(encryptMessageForBob)
		.tap(function assertMessageEncrypted(msg) {
			t.ok(Buffer.isBuffer(msg), 'Encrypted message is a Buffer.');
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
		}).then(function (cards) {
			if (cards.length === 0) {
				return null;
			}

			cards.sort(function (a, b) {
				return Date.parse(a.createdAt) - Date.parse(b.createdAt);
			});
			return cards[cards.length - 1];
		});
	}

	function encryptMessageForBob(bobCard) {
		var plainText = new Buffer('hello Bob! This is my secret message.');
		var pubkey = virgil.crypto.importPublicKey(bobCard.publicKey);
		var cipherText = virgil.crypto.encrypt(plainText, pubkey);
		return cipherText;
	}
});

test('bob decrypt', function (t) {
	var privateKey = virgil.crypto.importPrivateKey(bobPrivateKey);
	var plainText = virgil.crypto.decrypt(messageToBob, privateKey);
	t.equal(plainText.toString('utf8'), 'hello Bob! This is my secret message.', 'decrypted and plain texts are the same.');
	t.end();
});

var aliceSignature;
test('alice sign', function (t) {
	var privateKey = virgil.crypto.importPrivateKey(alicePrivateKey);
	var signedData = new Buffer('Sign me, please');
	aliceSignature = virgil.crypto.sign(signedData, privateKey);
	t.ok(Buffer.isBuffer(aliceSignature), 'Signature returned as Buffer.');
	t.end();
});

test('bob verify', function (t) {
	findAlice()
		.tap(function (card) {
			t.ok(card !== null, 'Alice\'s card was found.');
		})
		.then(verifyAliceSignature)
		.tap(function (isVerified) {
			t.ok(isVerified, 'Singature verified.');
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
			if (cards.length === 0) {
				return null;
			}

			cards.sort(function (a, b) {
				return Date.parse(a.createdAt) - Date.parse(b.createdAt);
			});
			return cards[cards.length - 1];
		});
	}

	function verifyAliceSignature(aliceCard) {
		var pubkey = virgil.crypto.importPublicKey(aliceCard.publicKey);
		var signedData = new Buffer('Sign me, please');
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

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
