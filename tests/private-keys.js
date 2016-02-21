var Promise = require('bluebird');
var test = require('tape');
var virgil = require('./helpers/virgil');
var getVirgilCard = require('./helpers/get-virgil-card');

test('private keys flow', function testVerify (t) {
	var keyPair, identity, virgilCard;
	getVirgilCard()
		.spread(stashPrivateKey)
		.then(assertStashPrivateKey)
		.then(getPrivateKey)
		.then(assertGetPrivateKey)
		.then(destroy)
		.then(assertDestroy)
		.catch(console.error);

	function stashPrivateKey (_keyPair, _identity, _virgilCard) {
		keyPair = _keyPair;
		identity = _identity;
		virgilCard = _virgilCard;

		return virgil.privateKeys.stash({
			virgil_card_id: virgilCard.id,
			private_key: keyPair.privateKey
		});
	}

	function assertStashPrivateKey (res) {
		logResponse('privateKeys.stash', res);
	}

	function getPrivateKey () {
		return virgil.privateKeys.get({
			virgil_card_id: virgilCard.id,
			identity: identity
		});
	}

	function assertGetPrivateKey (res) {
		logResponse('privateKeys.get', res);
		t.equal(res.private_key, keyPair.privateKey);
		t.equal(res.virgil_card_id, virgilCard.id);
	}

	function destroy () {
		return virgil.privateKeys.destroy({
			virgil_card_id: virgilCard.id,
			private_key: keyPair.privateKey
		});
	}

	function assertDestroy (res) {
		logResponse('privateKeys.destroy', res)
		t.end();
	}
});

test('private key stash passworded', function (t) {
	var password = 'keys password';
	getVirgilCard(password)
		.spread(stashPrivateKey)
		.then(assertStashPrivateKey)
		.catch(console.error);

	function stashPrivateKey (keyPair, identity, virgilCard) {
		return virgil.privateKeys.stash({
			virgil_card_id: virgilCard.id,
			private_key: keyPair.privateKey,
			private_key_password: password
		});
	}

	function assertStashPrivateKey (res) {
		logResponse('privateKeys.stash passworded', res);
		t.end();
	}
});

test('private keys local error', function (t) {
	return virgil.privateKeys.stash({
		virgil_card_id: 'nope',
		private_key: 'not a real key'
	}).catch(function (e) {
		t.end();
	});
});

test('private keys server error', function (t) {
	return virgil.privateKeys.get({
		virgil_card_id: 'e812f5af-0c06-4326-844b-0a31ab2c251a',
		identity: {}
	}).catch(function (e) {
		t.equal(e.code, 60010, 'error code match');
		t.end();
	});
});

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
