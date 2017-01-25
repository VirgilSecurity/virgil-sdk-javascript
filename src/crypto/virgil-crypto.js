var VirgilCrypto = require('virgil-crypto');
var CryptoKeyHandle = require('./crypto-key-handle');
var isBuffer = require('../shared/utils').isBuffer;
var isString = require('../shared/utils').isString;
var assert = require('../shared/utils').assert;
var stringToBuffer = require('../shared/utils').stringToBuffer;
var base64ToBuffer = require('../shared/utils').base64ToBuffer;

VirgilCrypto = VirgilCrypto.VirgilCrypto || VirgilCrypto;

/**
 * Represents a pair of cryptographic keys generated with an
 * asymmetric algorithm.
 *
 * @typedef {Object} KeyPair
 * @property {CryptoKeyHandle} privateKey - Private part of the key
 * @property {CryptoKeyHandle} publicKey - Public part of the key
 */

function virgilCrypto() {
	var keyMaterialStore = new WeakMap();

	return {
		generateKeys: generateKeys,
		importPrivateKey: importPrivateKey,
		importPublicKey: importPublicKey,
		exportPrivateKey: exportPrivateKey,
		exportPublicKey: exportPublicKey,
		extractPublicKey: extractPublicKey,
		encrypt: encrypt,
		decrypt: decrypt,
		encryptWithPassword: encryptWithPassword,
		decryptWithPassword: decryptWithPassword,
		sign: sign,
		verify: verify,
		hash: hash,
		calculateFingerprint: calculateFingerprint,
		signThenEncrypt: signThenEncrypt,
		decryptThenVerify: decryptThenVerify,
		HashAlgorithm: VirgilCrypto.HashAlgorithm,
		KeyPairType: VirgilCrypto.KeyPairType
	};

	/**
	 * Puts the key into internal storage, creates and returns a handle
	 * to the stored key.
	 *
	 * @param {string} type: The type of key (public or private)
	 * @param {Buffer} recipientId: Id of the intended recipient (i.e.
	 * 			owner of the key).
	 * @param {Buffer} value: The key material.
	 *
	 * @returns {CryptoKeyHandle}: The handle representing the key
	 *
	 * @private
	 * */
	function createKeyHandle (type, recipientId, value) {
		var key = new CryptoKeyHandle(type);
		keyMaterialStore.set(key, { recipientId: recipientId, value: value });
		return key;
	}

	/**
	 * Returns the key material corresponding to the key handle or
	 * throws an Error if the key does not exist.
	 *
	 * @returns {Buffer} - The key bytes.
	 *
	 * @private
	 * */
	function getKeyBytesFromHandle (keyHandle) {
		var key = keyMaterialStore.get(keyHandle);
		assert(Boolean(key), 'Object provided is not a valid key handle.');
		return key;
	}

	function createPrivateKeyHandle(recipientId, value) {
		return createKeyHandle('private', recipientId, value);
	}

	function createPublicKeyHandle(recipientId, value) {
		return createKeyHandle('public', recipientId, value);
	}

	/**
	 * Generates a new key pair.
	 *
	 * @param {KeyPairType} [keyPairType] - Optional type of the key pair.
	 * 			See {code: virgil.crypto.KeyPairType} for available options.
	 * @returns {Object.<{ publicKey: {CryptoKeyHandle}, privateKey: {CryptoKeyHandle}}>}:
	 * 			The newly generated key pair.
	 * */
	function generateKeys(keyPairType) {
		var keyPair = VirgilCrypto.generateKeyPair({ type: keyPairType });
		var publicKeyDER = VirgilCrypto.publicKeyToDER(keyPair.publicKey);
		var privateKeyDER = VirgilCrypto.privateKeyToDER(keyPair.privateKey);
		var keyPairId = VirgilCrypto.hash(publicKeyDER);

		return {
			privateKey: createPrivateKeyHandle(keyPairId, privateKeyDER),
			publicKey: createPublicKeyHandle(keyPairId, publicKeyDER)
		};
	}

	/**
	 * Imports a private key from a Buffer or base64-encoded string
	 * containing key material.
	 *
	 * @param {Buffer|string} privateKeyMaterial - The private key material.
	 * @param {string} [password] - Optional password the key is
	 * 			encrypted with.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPrivateKey(privateKeyMaterial, password) {
		assert(isBuffer(privateKeyMaterial) || isString(privateKeyMaterial),
			'Argument "privateKeyMaterial" must be a Buffer or a ' +
			'base64-encoded string');

		var privateKeyBytes = isString(privateKeyMaterial)
			? base64ToBuffer(privateKeyMaterial) : privateKeyMaterial;

		if (password) {
			privateKeyBytes = VirgilCrypto.decryptPrivateKey(
				privateKeyBytes, stringToBuffer(password));
		}

		var privateKeyDER = VirgilCrypto.privateKeyToDER(privateKeyBytes);
		var publicKey = VirgilCrypto.extractPublicKey(privateKeyDER);
		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKey);

		return createPrivateKeyHandle(
			VirgilCrypto.hash(publicKeyDER), privateKeyDER);
	}

	/**
	 * Imports a public key from a Buffer or base64-encoded string
	 * containing key material.
	 *
	 * @param {Buffer|string} publicKeyMaterial - The public key material.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPublicKey(publicKeyMaterial) {
		assert(isBuffer(publicKeyMaterial) || isString(publicKeyMaterial),
			'Argument "publicKeyMaterial" must be a Buffer or a string');

		var publicKeyBytes = isString(publicKeyMaterial)
			? base64ToBuffer(publicKeyMaterial) : publicKeyMaterial;

		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKeyBytes);
		return createPublicKeyHandle(
			VirgilCrypto.hash(publicKeyDER), publicKeyDER);
	}

	/**
	 * Exports the private key handle into a Buffer containing the key bytes.
	 *
	 * @param {CryptoKeyHandle} privateKey - The private key handle.
	 * @param {string} [password] - Optional password to encrypt the key with.
	 *
	 * @returns {Buffer} - The private key bytes.
	 * */
	function exportPrivateKey(privateKey, password) {
		var keyData = getKeyBytesFromHandle(privateKey);

		if (!password) {
			return VirgilCrypto.privateKeyToDER(keyData.value);
		}

		var passwordBuffer = stringToBuffer(password);
		var encryptedKey = VirgilCrypto.encryptPrivateKey(
			keyData.value, passwordBuffer);
		return VirgilCrypto.privateKeyToDER(encryptedKey, passwordBuffer);
	}

	/**
	 * Exports the public key handle into a Buffer containing the key bytes.
	 *
	 * @param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * @returns {Buffer} - The public key bytes.
	 * */
	function exportPublicKey(publicKey) {
		var keyData = getKeyBytesFromHandle(publicKey);
		return VirgilCrypto.publicKeyToDER(keyData.value);
	}

	/**
	 * Extracts a public key from the private key handle.
	 *
	 * @param {CryptoKeyHandle} privateKey - The private key handle.
	 * 			to extract from.
	 * @param {string} [password=''] - Optional password the private key
	 * 			is encrypted with.
	 *
	 * @returns {CryptoKeyHandle} - The handle to the extracted public key.
	 * */
	function extractPublicKey(privateKey, password) {
		var keyData = getKeyBytesFromHandle(privateKey);

		password = password || '';

		var publicKey = VirgilCrypto.extractPublicKey(
			keyData.value, stringToBuffer(password));
		return createPublicKeyHandle(
			keyData.recipientId, VirgilCrypto.publicKeyToDER(publicKey));
	}

	/**
	 * Encrypts the data for the recipient(s).
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF8.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} recipients - A handle to
	 * 			the public key of the intended recipient or an array of public
	 * 			key handles of multiple recipients.
	 *
	 * @returns {Buffer} - Encrypted data.
	 * */
	function encrypt(data, recipients) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be a Buffer or a string.');

		data = isString(data) ? stringToBuffer(data) : data;
		recipients = Array.isArray(recipients) ? recipients : [recipients];

		var publicKeys = recipients.map(function (recipientKey) {
			var keyData = getKeyBytesFromHandle(recipientKey);

			return {
				recipientId: keyData.recipientId,
				publicKey: keyData.value
			};
		});

		return VirgilCrypto.encrypt(data, publicKeys);
	}

	/**
	 * Decrypts the data with the private key.
	 *
	 * @param {Buffer|string} cipherData - A {Buffer} or a {string} in base64.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @returns {Buffer} - Decrypted data
	 * */
	function decrypt(cipherData, privateKey) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'Argument "cipherData" must be a Buffer or a ' +
			'base64-encoded string.');

		cipherData = isString(cipherData)
			? stringToBuffer(cipherData) : cipherData;

		var keyData = getKeyBytesFromHandle(privateKey);
		return VirgilCrypto.decrypt(
			cipherData, keyData.recipientId, keyData.value);
	}

	/**
	 * Calculates the signature on the data.
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @returns {Buffer} - The signature.
	 * */
	function sign(data, privateKey) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be a Buffer or a string.');

		data = isString(data) ? stringToBuffer(data) : data;

		var keyData = getKeyBytesFromHandle(privateKey);
		return VirgilCrypto.sign(data, keyData.value);
	}

	/**
	 * Verifies the provided data using the given signature and public key.
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 * @param {Buffer|string} signature - A {Buffer} or a {string} in base64.
	 * @param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * @returns {Boolean} - {code: true} or {code: false} depending on the
	 * 			validity of the signature.
	 * */
	function verify(data, signature, publicKey) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be a Buffer or a string.');

		assert(isBuffer(signature) || isString(data),
			'Argument "signature" must be a Buffer or a ' +
			'base64-encoded string.');

		data = isString(data) ? stringToBuffer(data) : data;
		signature = isString(signature) ? base64ToBuffer(data) : signature;

		var keyData = getKeyBytesFromHandle(publicKey);
		return VirgilCrypto.verify(data, signature, keyData.value);
	}

	/**
	 * Calculates the signature on the data using the private key,
	 * 		then encrypts the data along with the signature using
	 * 		the public key(s).
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 * @param {CryptoKeyHandle} privateKey - The private key handle.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} publicKeys - The handle
	 * 		of a public key of the intended recipient or an array of
	 * 		public key handles of multiple recipients.
	 *
	 * 	@returns {Buffer} Encrypted data with attached signature.
	 * */
	function signThenEncrypt(data, privateKey, publicKeys) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be a Buffer or a string.');

		data = isString(data) ? stringToBuffer(data) : data;

		var privateKeyData = getKeyBytesFromHandle(privateKey);

		publicKeys = Array.isArray(publicKeys) ? publicKeys : [publicKeys];
		var recipients = publicKeys.map(function (publicKey) {
			var pubKeyData = getKeyBytesFromHandle(publicKey);

			return {
				recipientId: pubKeyData.recipientId,
				publicKey: pubKeyData.value
			};
		});

		return VirgilCrypto.signThenEncrypt(data, privateKeyData.value, recipients);
	}

	/**
	 * Decrypts the data using the private key, then verifies decrypted data
	 * 		using the attached signature and the given public key.
	 *
	 * 	@param {Buffer|string} cipherData - A {Buffer} or a {string} in base64.
	 * 	@param {CryptoKeyHandle} privateKey - The private key handle.
	 * 	@param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * 	@returns {Buffer} - Decrypted data iff verification is successful,
	 * 			otherwise throws {code: VirgilCryptoError}.
	 * */
	function decryptThenVerify(cipherData, privateKey, publicKey) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'Argument "cipherData" must be a Buffer or a ' +
			'base64-encoded string.');

		cipherData = isString(cipherData)
			? base64ToBuffer(cipherData) : cipherData;

		var privateKeyData = getKeyBytesFromHandle(privateKey);
		var publicKeyData = getKeyBytesFromHandle(publicKey);

		return VirgilCrypto.decryptThenVerify(
			cipherData,
			privateKeyData.recipientId,
			privateKeyData.value,
			publicKeyData.value);
	}

	/**
	 * Calculates the fingerprint of the given data.
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 *
	 * @returns {Buffer} - The fingerprint.
	 * */
	function calculateFingerprint(data) {
		return hash(data, VirgilCrypto.HashAlgorithm.SHA256);
	}

	/**
	 * Calculates the hash of the given data.
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 * @param {string} [algorithm] - Optional name of the hash algorithm
	 * 		to use. See { code: virgilCrypto.HashAlgorithm }
	 * 		for available options.
	 *
	 * @returns {Buffer} - The hash.
	 * */
	function hash(data, algorithm) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be a Buffer or a string.');

		data = isString(data) ? stringToBuffer(data) : data;
		return VirgilCrypto.hash(data, algorithm);
	}

	/**
	 * Encrypts the data using the password to derive encryption key.
	 *
	 * @param {Buffer|string} data - A {Buffer} or a {string} in UTF-8.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Encrypted data.
	 * */
	function encryptWithPassword (data, password) {
		assert(isBuffer(data) || isString(data),
			'Argument "data" must be  a Buffer or a string');

		data = isString(data) ? stringToBuffer(data) : data;

		return VirgilCrypto.encrypt(data, stringToBuffer(password));
	}

	/**
	 * Decrypts the encrypted data using the password to derive decryption key.
	 *
	 * @param {Buffer|string} cipherData - A {Buffer} or a {string} in base64.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Decrypted data.
	 * */
	function decryptWithPassword (cipherData, password) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'Argument "cipherData" must be  a Buffer or a ' +
			'base64-encoded string');

		cipherData = isString(cipherData) ? base64ToBuffer(cipherData) : data;
		return VirgilCrypto.decrypt(cipherData, stringToBuffer(password));
	}
}

module.exports = virgilCrypto;
