var Promise = require('bluebird');

module.exports = function(crypto) {
	if (!crypto.signAsync) {
		crypto.signAsync = function(data, privateKey, privateKeyPassword) {
			var args = Array.prototype.slice.apply(arguments);
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.sign.apply(crypto, args));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.verifyAsync) {
		crypto.verifyAsync = function(data, publicKey, sign) {
			var args = Array.prototype.slice.apply(arguments);
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.verify.apply(crypto, args));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.encryptAsync) {
		crypto.encryptAsync = function(initialData, recipientId, publicKey) {
			var args = Array.prototype.slice.apply(arguments);
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.encrypt.apply(crypto, args));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.decryptAsync) {
		crypto.decryptAsync = function(initialEncryptedData, recipientId, privateKey, privateKeyPassword) {
			var args = Array.prototype.slice.apply(arguments);
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.decrypt.apply(crypto, args));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	return crypto;
};
