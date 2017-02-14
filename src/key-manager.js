'use strict';

var virgilKey = require('./virgil-key');

/**
 * Constructs and initializes objects that implement cryptographic key
 * managing functionality (i.e. generate, save, load, destroy).
 *
 * @param {VirgilAPIContext} context - The Virgil API context.
 * @constructs {KeyManager}
 */
function keyManager(context) {
	var crypto = context.crypto;
	var storage = context.keyStorage;

	return /** @lends {KeyManager} */ {

		/**
		 * Generates a cryptographic key with default parameters.
		 * @returns {VirgilKey}
         */
		generate: function () {
			var keyPair = crypto.generateKeys();
			return virgilKey(context, keyPair.privateKey);
		},

		/**
		 * Loads the key with the given name and password from storage.
		 * @param {string} name - The name under which the key is stored.
		 * @param {string} password - The password used for key encryption.
		 *
		 * @returns {Promise.<VirgilKey>}
         */
		load: function (name, password) {
			return storage.load(name, password)
				.then(function (privateKey) {
					return virgilKey(context, privateKey);
				});
		},

		/**
		 * Removes the key with the given name from storage.
		 * @param {string} name - The name of the key to remove.
         * @returns {Promise}
         */
		destroy: function (name) {
			return storage.remove(name);
		}
	}
}

module.exports = keyManager;
