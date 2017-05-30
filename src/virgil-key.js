'use strict';

var utils = require('./shared/utils');

/**
 * A wrapper on CryptoKeyHandle objects providing easier access to common
 * operations performed with keys (e.g. decrypt and sign data, save key
 * to storage etc.)
 *
 * @param {VirgilAPIContext} context - Virgil API context.
 * @param {CryptoKeyHandle} privateKey - The private key handle to wrap.
 * @constructor
 */
function VirgilKey (context, privateKey) {
	/**
	 * @type {VirgilAPIContext}
	 * @private
     */
	this._context = context;

	/**
	 * @type {CryptoKeyHandle}
	 * @private
     */
	this._privateKey = privateKey;
}

/**
 * Saves the key under the name encrypted with the password.
 * @param {string} name - The name under which the key is stored.
 * @param {string} [password] - Optional password to encrypt the key with.
 * @returns {Promise.<VirgilKey>}
 */
VirgilKey.prototype.save = function (name, password) {
	utils.assert(utils.isString(name),
		'save expects name argument to be passed as a string. ' +
		'Got ' + typeof  name);

	var privateKeyData = this._context.crypto.exportPrivateKey(
		this._privateKey,
		password);

	return this._context.keyStorage.store(name, privateKeyData)
		.then(function () {
			return this;
		}.bind(this));
};

/**
 * Calculate and return the signature for the data.
 * @param {(string|Buffer)} data - The data to calculate the signature
 * 		for. If data is a string, an encoding of UTF-8 is assumed.
 * @returns {Buffer} - The signature.
 */
VirgilKey.prototype.sign = function (data) {
	return this._context.crypto.sign(data, this._privateKey);
};

/**
 * Decrypts and returns the encrypted data.
 * @param {(string|Buffer)} cipherData - The data to be decrypted.
 * 		If cipherData is a string, an encoding of base64 is assumed.
 * @returns {Buffer}
 */
VirgilKey.prototype.decrypt = function (cipherData) {
	return this._context.crypto.decrypt(cipherData, this._privateKey);
};

/**
 * Calculates the signature for the data and encrypts the data along
 * with the signature for the given recipient(s).
 * @param {(string|Buffer)} data - The data to sign and encrypt. If
 * 		data is a string, an encoding of UTF-8 is assumed.
 * @param {VirgilCard|VirgilCard[]} recipientCard - The intended
 * 		recipient(s).
 * @returns {Buffer} - Encrypted data with attached signature.
 */
VirgilKey.prototype.signThenEncrypt = function (data, recipientCard) {
	var recipientCards = utils.toArray(recipientCard);
	utils.assert(
		recipientCards && recipientCards.length > 0,
		'signThenEncrypt requires at least one recipient card to be passed.'
	);

	var publicKeys = recipientCards.map(function (card) {
		return card.publicKey;
	});
	return this._context.crypto.signThenEncrypt(
		data, this._privateKey, publicKeys);
};

/**
 * Decrypts the encrypted data, then verifies decrypted data integrity
 * using the attached signature and the signer's card.
 * @param {(string|Buffer)} cipherData - The data to be decrypted and
 * 		checked. If cipherData is a string, an encoding of base64 is
 * 		assumed.
 * @param {(VirgilCard|VirgilCard[])} signerCard - The Virgil Card or an array
 * 		of Virgil Cards of the signing party.
 * @returns {*}
 */
VirgilKey.prototype.decryptThenVerify = function (cipherData, signerCard) {
	var signerCards = utils.toArray(signerCard);
	utils.assert(
		signerCards && signerCards.length > 0,
		'decryptThenVerify requires at least one signer card to be passed.'
	);

	var publicKeys = signerCards.map(function (card) {
		return card.publicKey;
	});
	return this._context.crypto.decryptThenVerify(
		cipherData,
		this._privateKey,
		publicKeys
	);
};

/**
 * Returns the private key material in DER format.
 * @param {string} [password] - Optional password to encrypt the key
 * 		with before exporting.
 * @returns {Buffer} - The raw key material.
 */
VirgilKey.prototype.export = function (password) {
	return this._context.crypto.exportPrivateKey(this._privateKey, password);
};

/**
 * Returns the public key material in DER format.
 * @returns {Buffer} - The raw key material.
 */
VirgilKey.prototype.exportPublicKey = function () {
	var publicKeyHandle = this._context.crypto.extractPublicKey(
		this._privateKey);
	return this._context.crypto.exportPublicKey(publicKeyHandle);
};

module.exports = VirgilKey;
