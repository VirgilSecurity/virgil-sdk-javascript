var getIdentity = require('./get-identity');
var virgil = require('./virgil');

module.exports = function (password) {
	if (password) {
		var keyPair = virgil.crypto.generateKeyPair(password);
	} else {
		var keyPair = virgil.crypto.generateKeyPair();
	}

	var identity;
	return getIdentity()
		.then(function (res) {
			identity = res;
			return virgil.cards.create({
				public_key: keyPair.publicKey,
				private_key: keyPair.privateKey,
				private_key_password: password,
				identity: res
			});
		})
		.then(function (res) {
			return [keyPair, identity, res];
		});
};
