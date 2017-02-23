var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../');
var mailinator = require('./helpers/mailinator');

global.Promise = require('bluebird');

var localCardIdentity = 'js_sdk_test_' + String(Math.random()).slice(2);

var globalCardIdentity = 'js_sdk_test_' + String(Math.random()).slice(2) +
	'@mailinator.com';
var globalCardPrivateKey = 'MC4CAQAwBQYDK2VwBCIEII4ETcxRAM/zjJhY3bbijJw' +
	'GZKx20EL1WvR/yvP4y2+x';
var globalCardPublicKey = 'MCowBQYDK2VwAyEA0RFvefYOfVGfkiFGthdHQXoN1k/G' +
	'wh6J9IDkPREQRro=';

function setup() {
	var appCardId = virgilConfig.appCardId;
	var appPrivateKey = virgil.crypto.importPrivateKey(
		virgilConfig.appPrivateKey,
		virgilConfig.appPrivateKeyPassword);

	var client = virgil.client(virgilConfig.accessToken, virgilConfig);
	var globalCardKeys = {
		privateKey: virgil.crypto.importPrivateKey(globalCardPrivateKey),
		publicKey: virgil.crypto.importPublicKey(globalCardPublicKey)
	};

	return {
		appCardId: appCardId,
		appPrivateKey: appPrivateKey,
		client: client,
		globalCardKeys: globalCardKeys
	};
}

// Application scope cards

test('publish application virgil card', function (t) {
	var fixture = setup();
	var appCardId = fixture.appCardId;
	var appPrivateKey = fixture.appPrivateKey;
	var client = fixture.client;

	var keyPair = virgil.crypto.generateKeys();
	var rawPublicKey = virgil.crypto.exportPublicKey(keyPair.publicKey);

	var publishCardRequest = virgil.publishCardRequest({
		identity: localCardIdentity,
		identity_type: 'username',
		scope: virgil.CardScope.APPLICATION,
		public_key: rawPublicKey.toString('base64')
	});

	var requestSigner = virgil.requestSigner(virgil.crypto);
	requestSigner.selfSign(publishCardRequest, keyPair.privateKey);
	requestSigner.authoritySign(publishCardRequest, appCardId, appPrivateKey);

	return client.publishCard(publishCardRequest)
		.then(function (card) {
			t.ok(card, 'Application card is published');
			t.ok(Object.keys(card.signatures).length === 3,
				'service signature appended');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to publish application virgil card. ' +
				err.message);
		});
});

test('search application virgil card', function (t) {
	var fixture = setup();
	var client = fixture.client;

	client.searchCards({
		identities: [localCardIdentity],
		identity_type: 'username'
	}).then(function (cards) {
		t.ok(cards.length > 0, 'Application card is found.');
		t.ok(cards.every(function (card) {
			return card.identity === localCardIdentity;
		}), 'Fetched cards identities match the searched one.');
		t.end();
	});
});

test('get application card by id', function (t) {
	var fixture = setup();
	var client = fixture.client;

	client.searchCards(localCardIdentity).then(function (cards) {
		if (cards.length === 0) {
			t.fail('Search for application card failed.');
		}
		var lastFound = cards[cards.length - 1];
		var id = lastFound.id;
		client.getCard(id)
			.then(function (card) {
				t.ok(card, 'Got card by id.');
				t.equal(card.identity, localCardIdentity, 'Fetched card identity matches');
				t.end();
			})
			.catch(function (err) {
				t.fail(err.message);
			});
	});
});

test('revoke application card', function (t) {
	var fixture = setup();
	var appCardId = fixture.appCardId;
	var appPrivateKey = fixture.appPrivateKey;
	var client = fixture.client;

	client.searchCards({
		identities: [localCardIdentity]
	}).then(function (cards) {
		if (cards.length === 0) {
			t.fail('Search for application card failed.');
		}

		var cardToRevoke = cards[cards.length - 1];

		var revokeRequest = virgil.revokeCardRequest({
			card_id: cardToRevoke.id,
			revocation_reason: virgil.RevocationReason.UNSPECIFIED
		});

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.authoritySign(revokeRequest, appCardId, appPrivateKey);

		return client.revokeCard(revokeRequest);
	}).then(function () {
		t.pass('Application card revoked.');
		t.end();
	}).catch(function (err) {
		t.fail('Failed to revoke application card. ' + err.message);
	});
});


// Global scope cards

test('publish global virgil card', function (t) {
	var fixture = setup();
	var client = fixture.client;
	var keyPair = fixture.globalCardKeys;

	var identity = globalCardIdentity;
	var identityType = virgil.IdentityType.EMAIL;

	client.verifyIdentity(identity, identityType)
		.then(function (actionId) {
			return mailinator.getConfirmationCode(identity)
				.then(function (code) {
					return [actionId, code];
				});
		})
		.spread(function (actionId, code) {
			return client.confirmIdentity(actionId, code);
		})
		.then(function (validationToken) {
			var rawPublicKey = virgil.crypto
				.exportPublicKey(keyPair.publicKey);

			var publishCardRequest = virgil.publishCardRequest({
				identity: identity,
				identity_type: identityType,
				scope: virgil.CardScope.GLOBAL,
				public_key: rawPublicKey.toString('base64')
			}, validationToken);

			var requestSigner = virgil.requestSigner(virgil.crypto);
			requestSigner.selfSign(publishCardRequest, keyPair.privateKey);

			return client.publishGlobalCard(publishCardRequest);
		})
		.then(function (card) {
			t.ok(card, 'Global card is published');
			t.ok(Object.keys(card.signatures).length === 3,
				'Virgil Cards and VRA signatures appended');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to publish global virgil card. ' +
				err.message);
		});
});

test('search global virgil card', function (t) {
	var fixture = setup();
	var client = fixture.client;

	client.searchCards({
		identities: [globalCardIdentity],
		identity_type: virgil.IdentityType.EMAIL,
		scope: virgil.CardScope.GLOBAL
	}).then(function (cards) {
		t.ok(cards.length > 0, 'Global card is found.');
		t.ok(cards.every(function (card) {
			return card.identity === globalCardIdentity;
		}), 'Fetched cards identities match the searched one.');
		t.end();
	});
});

test('get global virgil card by id', function (t) {
	var fixture = setup();
	var client = fixture.client;

	client.searchCards({
		identities: [globalCardIdentity],
		scope: virgil.CardScope.GLOBAL
	}).then(function (cards) {
		if (cards.length === 0) {
			t.fail('Search for global card failed.');
		}
		var lastFound = cards[cards.length - 1];
		var id = lastFound.id;
		client.getCard(id)
			.then(function (card) {
				t.ok(card, 'Got global card by id.');
				t.equal(card.identity, globalCardIdentity, 'Fetched card identity matches');
				t.end();
			})
			.catch(function (err) {
				t.fail(err.message);
			});
	});
});

test('revoke global virgil card', function (t) {
	var fixture = setup();
	var client = fixture.client;
	var keyPair = fixture.globalCardKeys;

	var identity = globalCardIdentity;
	var identityType = virgil.IdentityType.EMAIL;

	client.verifyIdentity(identity, identityType)
	// add 10 second delay to give the service the time to deliver the
	// confirmation message
	.delay(10000)
	.then(function (actionId) {
		return mailinator.getConfirmationCode(identity)
			.then(function (code) {
				return [actionId, code];
			});
	})
	.spread(function (actionId, code) {
		return client.confirmIdentity(actionId, code);
	})
	.then(function (validationToken) {
		return client.searchCards({
			identities: [identity],
			scope: virgil.CardScope.GLOBAL
		}).then(function (cards) {
			if (cards.length === 0) {
				t.fail('Search for global card failed.');
			}

			var cardToRevoke = cards[cards.length - 1];
			return [cardToRevoke.id, validationToken];
		});
	})
	.spread(function (cardId, validationToken) {
		var revokeRequest = virgil.revokeCardRequest({
			card_id: cardId,
			revocation_reason: virgil.RevocationReason.UNSPECIFIED
		}, validationToken);

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.authoritySign(revokeRequest, cardId, keyPair.privateKey);

		return client.revokeGlobalCard(revokeRequest);
	})
	.then(function () {
		t.pass('Global card revoked.');
		t.end();
	})
	.catch(function (err) {
		t.fail('Failed to revoke global card. ' + err.message);
	});
});
