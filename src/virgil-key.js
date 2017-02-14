'use strict';

var utils = require('./shared/utils');

/**
 * Creates and initializes the VirgilKey objects, a wrapper on CryptoKeyHandle
 * objects providing easier access to common operations performed on keys
 * (e.g. decrypt and sign data, save key to storage etc.)
 *
 * <code>VirgilKey</code> object are not to be created directly. Use the
 * <code>virgilKey</code> factory function to create an instance.
 *
 * @param {VirgilAPIContext} context - Virgil API context.
 * @param {CryptoKeyHandle} privateKey - The card model to wrap.
 * @constructs {VirgilKey}
 */
function virgilKey (context, privateKey) {
	var storage = context.keyStorage;
	var crypto = context.crypto;

	return /** @lends {VirgilKey} */ {
		/**
		 * Saves the key under the name encrypted with the password.
		 * @param {string} name - The name under which the key is stored.
		 * @param {string} password - The password to encrypt the key with.
         * @returns {Promise}
         */
		save: function (name, password) {
			return storage.store(name, privateKey, password);
		},

		/**
		 * Calculate and return the signature for the data.
		 * @param {(string|Buffer)} data - The data to calculate the signature
		 * 		for. If data is a string, an encoding of UTF-8 is assumed.
         * @returns {Buffer} - The signature.
         */
		sign: function (data) {
			return crypto.sign(data, privateKey);
		},

		/**
		 * Decrypts and returns the encrypted data.
		 * @param {(string|Buffer)} cipherData - The data to be decrypted.
		 * 		If cipherData is a string, an encoding of base64 is assumed.
		 * @returns {Buffer}
         */
		decrypt: function (cipherData) {
			return crypto.decrypt(cipherData, privateKey);
		},

		/**
		 * Calculates the signature for the data and encrypts the data along
		 * with the signature for the given recipient(s).
		 * @param {(string|Buffer)} data - The data to sign and encrypt. If
		 * 		data is a string, an encoding of UTF-8 is assumed.
		 * @param {VirgilCard|VirgilCard[]} recipientCards - The intended
		 * 		recipient(s).
         * @returns {Buffer} - Encrypted data with attached signature.
         */
		signThenEncrypt: function (data, recipientCards) {
			var publicKeys = utils.toArray(recipientCards)
				.map(function (card) {
					return card.publicKey;
				});
			return crypto.signThenEncrypt(data, privateKey, publicKeys)
		},

		/**
		 * Decrypts the encrypted data, then verifies decrypted data integrity
		 * using the attached signature and the signer's card.
		 * @param {(string|Buffer)} cipherData - The data to be decrypted and
		 * 		checked. If cipherData is a string, an encoding of base64 is
		 * 		assumed.
		 * @param {VirgilCard} signerCard - The Virgil Card of the signing
		 * 		party.
         * @returns {*}
         */
		decryptThenVerify: function (cipherData, signerCard) {
			return crypto.decryptThenVerify(
				cipherData, privateKey, signerCard.publicKey);
		},

		/**
		 * Returns the private key material in DER format.
		 * @param {string} [password] - Optional password to encrypt the key
		 * 		with before exporting.
		 * @returns {Buffer} - The raw key material.
         */
		export: function (password) {
			return crypto.exportPrivateKey(privateKey, password);
		},

		/**
		 * Returns the public key material in DER format.
		 * @returns {Buffer} - The raw key material.
         */
		exportPublicKey: function () {
			var publicKeyHandle = crypto.extractPublicKey(privateKey);
			return crypto.exportPublicKey(publicKeyHandle);
		}
	}
}

module.exports = virgilKey;
