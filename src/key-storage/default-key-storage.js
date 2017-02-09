'use strict';

/**
 *	Factory function to construct encrypted cryptographic keys storage
 *	containers.
 *	@param {StorageAdapter} storageBackend - Persistent storage backend.
 *	@param {Object} crypto - Cryptographic operations provider.
 * */
function defaultKeyStorage (storageBackend, crypto) {

	return /** @implements {KeyStorage} */ {
		/**
		 * Persists the private key encrypted with password under a name.
		 * @param {string} name - Name of key.
		 * @param {CryptoKeyHandle} privateKey - Key to store.
		 * @param {string} password - Password to use for encryption.
		 *
		 * @returns {Promise} - A Promise that will be resolved when the key
		 * has been persisted.
		 * */
		store: function (name, privateKey, password) {
			return storageBackend.save(name, encryptKey(privateKey, password));
		},

		/**
		 * Gets the private key stored under name decrypting it using the
		 * password.
		 * @param {string} name Name of key.
		 * @param {string} password Password to use for decryption.
		 *
		 * @returns {Promise.<CryptoKeyHandle>} Promise that will be resolved
		 * with the stored key.
		 * */
		load: function (name, password) {
			return storageBackend.load(name)
				.then(function (encryptedKey) {
					return decryptKey(encryptedKey, password);
				});
		},

		/**
		 * Removes the private key stored under name from persistent storage.
		 * @param {string} name Name of key to remove.
		 *
		 * @returns {Promise} - A Promise that will be resolved when the key
		 * has been removed.
		 * */
		remove: function (name) {
			return storageBackend.remove(name);
		}
	};

	/**
	 * Encrypts the key with password.
	 * @param {CryptoKeyHandle} key - Key to encrypt
	 * @param {string} password - Password to use for encryption.
	 *
	 * @returns {Buffer}
	 * @private
	 * */
	function encryptKey (key, password) {
		return crypto.exportPrivateKey(key, password);
	}

	/**
	 * Decrypts the data with password.
	 * @param {Buffer} encryptedKey - Encrypted key.
	 * @param {string} password - Password to use for decryption.
	 *
	 * @returns {CryptoKeyHandle}
	 * @private
	 * */
	function decryptKey (encryptedKey, password) {
		return crypto.importPrivateKey(encryptedKey, password);
	}
}

module.exports = defaultKeyStorage;
