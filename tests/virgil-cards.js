var Promise = require('bluebird');
var test = require('tape');
var virgil = require('./helpers/virgil');
var getIdentity = require('./helpers/get-identity');
var VirgilSDK = require('../');

var keyPair = virgil.crypto.generateKeyPair();
var signedCard;

test('virgil cards flow', function testVerify (t) {
	var card, identity;

	getIdentity()
		.then(publishVirgilCard)
		.tap(assertPublishResponse)
		.then(search)
		.tap(assertSearch)
		.then(searchGlobal)
		.tap(assertSearchGlobal)
		.then(getPublicKey)
		.tap(assertGetPublicKey)
		.then(revokeCard)
		.tap(assertRevokeCard)
		.catch(console.error);

	function publishVirgilCard (res) {
		identity = res;
		return virgil.cards.create({
			public_key: keyPair.publicKey,
			private_key: keyPair.privateKey,
			identity: res
		});
	}

	function assertPublishResponse (res) {
		logResponse('cards.create', res);
		t.ok(res, 'card is published');
		t.equal(res.authorized_by, 'com.virgilsecurity.identity', 'authorized_by com.virgilsecurity.identity');
		t.equal(res.public_key.public_key, keyPair.publicKey, 'public key matches');
		card = res;
	}

	function search (res) {
		return virgil.cards.search({
			value: res.identity.value,
			type: 'email'
		});
	}

	function assertSearch (res) {
		logResponse('cards.search', res);
		t.ok(!res.length, 'card is not found');
	}

	function searchGlobal () {
		return virgil.cards.searchGlobal({ value: 'com.virgilsecurity.*', type: VirgilSDK.IdentityTypes.application });
	}

	function assertSearchGlobal (res) {
		logResponse('cards.searchGlobal', res)
		t.ok(res[0], 'app card is found');
		signedCard = res[0];
	}

	function getPublicKey () {
		return virgil.publicKeys.getPublicKey({ public_key_id: card.public_key.id });
	}

	function assertGetPublicKey (res) {
		logResponse('publicKeys.getPublicKey', res);
	}

	function revokeCard () {
		return virgil.cards.revoke({
			virgil_card_id: card.id,
			private_key: keyPair.privateKey,
			identity: identity
		});
	}

	function assertRevokeCard (res) {
		logResponse('cards.revoke', res);
		t.end();
	}
});

test('virgil cards public passworded key', function (t) {
	var card, identity;
	var password = 'this is password';
	var keyPair = virgil.crypto.generateKeyPair(password);
	console.log('generated passworded keyPair');

	getIdentity()
		.then(publishVirgilCard)
		.tap(assertPublishResponse)
		.catch(console.error);

	function publishVirgilCard (res) {
		return virgil.cards.create({
			public_key: keyPair.publicKey,
			private_key: keyPair.privateKey,
			private_key_password: password,
			identity: res
		}).catch(console.log);
	}

	function assertPublishResponse (res) {
		console.log('Start asserting passworded response');
		logResponse('cards.create', res);
		t.ok(res, 'card is published (passworded)');
		t.equal(res.authorized_by, 'com.virgilsecurity.identity', 'authorized_by com.virgilsecurity.identity');
		t.equal(res.public_key.public_key, keyPair.publicKey, 'public key matches');
		t.end();
	}
});

test('create private virgil card', function (t) {
	var card, identity;

	getPrivateIdentity()
		.then(publishVirgilCard)
		.tap(assertPublishResponse)
		.then(search)
		.tap(assertSearch)
		.catch(console.error);

	function getPrivateIdentity () {
		var username = 'testjssdk' + Math.random();
		var identityType = 'username';
		var token = VirgilSDK.utils.generateValidationToken(
			username,
			identityType,
			process.env.VIRGIL_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
			process.env.VIRGIL_APP_PRIVATE_KEY_PASSWORD
		);

		return Promise.resolve({
			value: username,
			type: identityType,
			validation_token: token
		});
	}

	function publishVirgilCard (res) {
		identity = res;
		return virgil.cards.create({
			public_key: keyPair.publicKey,
			private_key: keyPair.privateKey,
			identity: res
		});
	}

	function assertPublishResponse (res) {
		logResponse('cards.create', res);
		t.ok(res, 'card is published');
		t.equal(res.authorized_by, process.env.VIRGIL_APP_BUNDLE, 'authorized_by com.virgilsecurity.identity');
		t.equal(res.public_key.public_key, keyPair.publicKey, 'public key matches');
		card = res;
	}

	function search (res) {
		return virgil.cards.search({
			value: res.identity.value,
			type: 'email'
		});
	}

	function assertSearch (res) {
		logResponse('cards.search', res);
		t.ok(res.length, 'card is found');
		t.end();
	}
});

test('virgil cards server error', function (t) {
	return virgil.cards.create({
		public_key: keyPair.publicKey,
		private_key: keyPair.privateKey,
		identity: {}
	}).catch(function (e) {
		t.equal(e.code, 30205, 'error code match');
		t.end();
	});
});

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
