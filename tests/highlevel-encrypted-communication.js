var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../src/virgil');

global.Promise = require('bluebird');

var ALICE_IDENTITY = 'alice_test_sdk';
var BOB_IDENTITY = 'bob_test_sdk';

var KEY_PASSWORD = 'q1w2e3$';

function setup() {
	var appCredentials = {
		appId: virgilConfig.appCardId,
		appKeyData: virgilConfig.appPrivateKey,
		appKeyPassword: virgilConfig.appPrivateKeyPassword
	};

	var accessToken = virgilConfig.accessToken;

	return {
		appCredentials: appCredentials,
		accessToken: accessToken,
		clientParams: virgilConfig
	};
}

test('setup alice', function (t) {
	var config = setup();
	var api = virgil.API(config);

	var key = api.keys.generate();
	key.save(ALICE_IDENTITY, KEY_PASSWORD)
		.then(function () {
			var card = api.cards.create(ALICE_IDENTITY, key);
			return api.cards.publish(card)
		})
		.then(function () {
			t.pass('Alice\'s card published');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to publish Alice\'s card. ' + err.message);
		});
});

test('setup bob', function (t) {
	var config = setup();
	var api = virgil.API(config);

	var key = api.keys.generate();
	key.save(BOB_IDENTITY, KEY_PASSWORD)
		.then(function () {
			var card = api.cards.create(BOB_IDENTITY, key);
			return api.cards.publish(card)
		})
		.then(function () {
			t.pass('Bob\'s card published');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to publish Bob\'s card. ' + err.message);
		});
});

var messageToBob;

test('alice encrypt message for bob', function (t) {
	var config = setup();
	var api = virgil.API(config);

	findBob()
		.tap(function (card) {
			t.ok(card !== null, 'Bob\'s card found.');
		})
		.then(encryptMessageForBob)
		.then(function (msg) {
			t.ok(Buffer.isBuffer(msg), 'Encrypted message is a Buffer.');
			messageToBob = msg;
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to encrypt message for Bob. ' + err.message);
		});

	function findBob() {
		return api.cards.find(BOB_IDENTITY)
			.then(function (cards) {
				if (cards.length === 0) {
					return null;
				}

				cards.sort(function (a, b) {
					return a.createdAt - b.createdAt;
				});
				return cards[cards.length - 1];
			});
	}

	function encryptMessageForBob(bobCard) {
		var plainText = 'hello Bob! This is my secret message.';
		return bobCard.encrypt(plainText);
	}
});

test('bob decrypt message', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.keys.load(BOB_IDENTITY, KEY_PASSWORD)
		.then(function (key) {
			var plainText = key.decrypt(messageToBob);
			t.equal(plainText.toString('utf8'),
				'hello Bob! This is my secret message.',
				'decrypted and plain texts match.');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed load Bob\'s key ' + err.message);
		});
});

var aliceSignature;
test('alice sign', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.keys.load(ALICE_IDENTITY, KEY_PASSWORD)
		.then(function (key) {
			aliceSignature = key.sign('Sign me, please');
			t.ok(Buffer.isBuffer(aliceSignature),
				'signature is a Buffer.');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed load Bob\'s key ' + err.message);
		});
});

test('bob verify', function (t) {
	var config = setup();
	var api = virgil.API(config);

	findAlice()
		.tap(function (card) {
			t.ok(card !== null, 'Alice\'s card was found.');
		})
		.then(verifyAliceSignature)
		.then(function (isVerified) {
			t.ok(isVerified, 'data verified.');
			t.end();
		}).catch(function (err) {
			t.fail('Failed to verify Alice\'s signature. ' + err.message);
		});

	function findAlice() {
		return api.cards.find(ALICE_IDENTITY)
			.then(function (cards) {
				if (cards.length === 0) {
					return null;
				}

				cards.sort(function (a, b) {
					return a.createdAt - b.createdAt;
				});
				return cards[cards.length - 1];
			});
	}

	function verifyAliceSignature(aliceCard) {
		return aliceCard.verify('Sign me, please', aliceSignature);
	}
});

test('cleanup alice', function (t) {
	var config = setup();
	var api = virgil.API(config);

	findAlice()
		.tap(function (aliceCard) {
			t.ok(aliceCard !== null, 'Alice\'s card not found');
		})
		.then(function (aliceCard) {
			return api.cards.revoke(aliceCard);
		})
		.then(function () {
			t.pass('Alice\'s card revoked');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to revoke Alice\'s card. ' + err.message);
		});


	function findAlice() {
		return api.cards.find(ALICE_IDENTITY)
			.then(function (cards) {
				if (cards.length === 0) {
					return null;
				}

				cards.sort(function (a, b) {
					return a.createdAt - b.createdAt;
				});
				return cards[cards.length - 1];
			});
	}
});

test('cleanup bob', function (t) {
	var config = setup();
	var api = virgil.API(config);

	findBob()
		.tap(function (bobCard) {
			t.ok(bobCard !== null, 'Bob\'s card not found');
		})
		.then(function (bobCard) {
			return api.cards.revoke(bobCard);
		})
		.then(function () {
			t.pass('Bob\'s card revoked');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to revoke Bob\'s card. ' + err.message);
		});


	function findBob() {
		return api.cards.find(BOB_IDENTITY)
			.then(function (cards) {
				if (cards.length === 0) {
					return null;
				}

				cards.sort(function (a, b) {
					return a.createdAt - b.createdAt;
				});
				return cards[cards.length - 1];
			});
	}
});
