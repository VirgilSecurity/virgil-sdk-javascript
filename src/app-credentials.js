'use strict';

/**
 * @typedef {Object} AppCredentialsInfo
 *
 * @property {string} appId - The application id from Developer portal.
 * @property {(Buffer|string)} appKeyMaterial - The application's private key
 * 		material. If it's a string, an encoding of base64 is assumed.
 * @property {string} [appKeyPassword] - Optional password the app key is
 * 		encrypted with (if applies).
 * */

/**
 * Creates and initializes the application credentials container objects.
 *
 * <code>AppCredentials</code> objects are not to be created directly using
 * the <code>new</code> keyword. Use the <code>appCredentials()</code> factory
 * function to create an instance.
 *
 * @example
 *
 * var credentials = virgil.appCredentials({
 * 		appId: 'appId',
 * 		appKeyMaterial: 'app_key_material_base64',
 * 		appKeyPassword: 'app_key_password'
 * });
 *
 * @param {AppCredentialsInfo} params - The application credentials.
 *
 * @constructs AppCredentials
 * */
function appCredentials (params) {
	var appId = params.appId;
	var appKeyMaterial = params.appKeyMaterial;
	var appKeyPassword = params.appKeyPassword;

	return /** @lends {AppCredentials} */ {
		/**
		 * Gets the application's id.
		 * @returns {string}
         */
		getAppId: function () {
			return appId;
		},

		/**
		 * Gets the handle to the application's private key.
		 * @param {Crypto} crypto - The cryptographic operations provider.
		 * @returns {CryptoKeyHandle}
         */
		getAppKey: function (crypto) {
			return crypto.importPrivateKey(appKeyMaterial, appKeyPassword);
		}
	}
}

module.exports = appCredentials;
