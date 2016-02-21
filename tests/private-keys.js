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

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
