var Promise = require('bluebird');

module.exports = function(crypto) {
	if (!crypto.signAsync) {
		crypto.signAsync = function(data, privateKey, privateKeyPassword) {
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.sign(data, privateKey, privateKeyPassword));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.verifyAsync) {
		crypto.verifyAsync = function(data, publicKey, sign) {
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.verify(data, publicKey, sign));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.encryptAsync) {
		crypto.encryptAsync = function(initialData, recipientId, publicKey) {
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.encrypt(initialData, recipientId, publicKey));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	if (!crypto.decryptAsync) {
		crypto.decryptAsync = function(initialEncryptedData, recipientId, privateKey, privateKeyPassword) {
			return new Promise(function(resolve, reject) {
				try {
					resolve(crypto.decrypt(initialEncryptedData, recipientId, privateKey, privateKeyPassword));
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	return crypto;
};
