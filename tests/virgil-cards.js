var test = require('tape');
var virgil = require('./helpers/virgil');
var getIdentity = require('./helpers/get-identity');

var keyPair = virgil.crypto.generateKeyPair();

var signedCard = {
	id: 'e812f5af-0c06-4326-844b-0a31ab2c251a',
	hash: 'KkDKOTFTt3SxF+ZEGuhEepqERTpXIIz5fitScB1qvUPWKv8iWkgJPCLi4xPUu5kinxAYBhgAIanunvpgv3uY8A=='
};

test('virgil cards flow', function testVerify (t) {
	var card, identity;

	getIdentity()
		.then(publishVirgilCard)
		.tap(assertPublishResponse)
		.then(search)
		.tap(assertSearch)
		.then(searchApp)
		.tap(assertSearchApp)
		.then(trust)
		.tap(assertTrust)
		.then(untrust)
		.tap(assertUntrust)
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
		t.ok(res.is_confirmed, 'card is confirmed');
		t.ok(res.identity.is_confirmed, 'identity is confirmed');
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
		t.equal(res[0].public_key.public_key, keyPair.publicKey, 'search public key is ok');
	}

	function searchApp () {
		return virgil.cards.searchApp({ value: "com.testjavascript.*" });
	}

	function assertSearchApp (res) {
		logResponse('cards.searchApp', res)
		t.ok(res[0].is_confirmed, 'found app is confirmed');
	}

	function trust () {
		return virgil.cards.trust({
			signed_virgil_card_id: signedCard.id,
			signed_virgil_card_hash: signedCard.hash,
			private_key: keyPair.privateKey,
			virgil_card_id: card.id
		});
	}

	function assertTrust (res) {
		logResponse('cards.trust', res);
		t.equal(res.signer_virgil_card_id, card.id, 'signer card is ok');
		t.equal(res.signed_virgil_card_id, signedCard.id, 'signed card is ok');
	}

	function untrust () {
		return virgil.cards.untrust({
			signed_virgil_card_id: signedCard.id,
			private_key: keyPair.privateKey,
			virgil_card_id: card.id
		});
	}

	function assertUntrust (res) {
		logResponse('cards.untrust', res);
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
		});
	}

	function assertPublishResponse (res) {
		logResponse('cards.create', res);
		t.ok(res.is_confirmed, 'card is confirmed');
		t.ok(res.identity.is_confirmed, 'identity is confirmed');
		t.equal(res.public_key.public_key, keyPair.publicKey, 'public key matches');
		t.end();
	}
});

test('virgil cards server error', function (t) {
	return virgil.cards.create({
		public_key: keyPair.publicKey,
		private_key: keyPair.privateKey,
		identity: {}
	}).catch(function (e) {
		t.equal(e.code, 30201, 'error code match');
		t.end();
	});
});

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
