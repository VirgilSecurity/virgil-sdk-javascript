var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../');

var appCardId = virgilConfig.appCardId;
var appPrivateKey = virgil.crypto.importPrivateKey(
	new Buffer(virgilConfig.appPrivateKey, 'base64'),
	virgilConfig.appPrivateKeyPassword);

var client = virgil.client(virgilConfig.accessToken, virgilConfig);

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

		var createCardRequest = virgil.cardCreateRequest({
			identity: username,
			identity_type: 'username',
			public_key: rawPublicKey
		});

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.selfSign(createCardRequest, keyPair.privateKey);
		requestSigner.authoritySign(createCardRequest, appCardId, appPrivateKey);

		return client.createCard(createCardRequest)
			.then(function (card) {
				createdCard = card;
				return card;
			});
	}

	function assertPublishResponse (res) {
		logResponse('client#createCard', res);
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
		t.ok(res.length > 0, 'card is not found');
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
		t.ok(res.length > 0, 'global cards not found');
	}

	function revokeCard () {
		var revokeRequest = virgil.cardRevokeRequest({
			card_id: createdCard.id,
			revocation_reason: 'unspecified'
		});

		var requestSigner = virgil.requestSigner(virgil.crypto);
		requestSigner.authoritySign(revokeRequest, appCardId, appPrivateKey);

		return client.revokeCard(revokeRequest);
	}

	function assertRevokeCard (res) {
		logResponse('client#revokeCards', res);
		t.end();
	}
});

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
