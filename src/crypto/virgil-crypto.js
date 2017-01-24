var VirgilCrypto = require('virgil-crypto');
var CryptoKeyHandle = require('./crypto-key-handle');
var isBuffer = require('../shared/utils').isBuffer;
var assert = require('../shared/utils').assert;
var stringToBuffer = require('../shared/utils').stringToBuffer;


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
	 * Imports a private key from a Buffer containing key bytes.
	 *
	 * @param {Buffer} privateKeyBytes - The private key bytes.
	 * @param {string} [password] - Optional password the key is encrypted with.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPrivateKey(privateKeyBytes, password) {
		assert(isBuffer(privateKeyBytes), 'Argument "privateKeyBytes" must be a Buffer');

		if (password) {
			privateKeyBytes = VirgilCrypto.decryptPrivateKey(privateKeyBytes, stringToBuffer(password));
		}

		var privateKeyDER = VirgilCrypto.privateKeyToDER(privateKeyBytes);
		var publicKey = VirgilCrypto.extractPublicKey(privateKeyDER);
		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKey);

		return createPrivateKeyHandle(VirgilCrypto.hash(publicKeyDER), privateKeyDER);
	}

	/**
	 * Imports a public key from a Buffer containing key bytes.
	 *
	 * @param {Buffer} publicKeyBytes - The public key bytes.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPublicKey(publicKeyBytes) {
		assert(isBuffer(publicKeyBytes), 'Argument "publicKeyBytes" should be a Buffer');
		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKeyBytes);
		return createPublicKeyHandle(VirgilCrypto.hash(publicKeyDER), publicKeyDER);
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
		var encryptedKey = VirgilCrypto.encryptPrivateKey(keyData.value, passwordBuffer);
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

		var publicKey = VirgilCrypto.extractPublicKey(keyData.value, stringToBuffer(password));
		return createPublicKeyHandle(keyData.recipientId, VirgilCrypto.publicKeyToDER(publicKey));
	}

	/**
	 * Encrypts the data for the recipient(s).
	 *
	 * @param {Buffer} data - The data to encrypt.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} recipients - A handle to
	 * 			the public key of the intended recipient or array of public
	 * 			key handles of multiple recipients.
	 *
	 * @returns {Buffer} - Encrypted data.
	 * */
	function encrypt(data, recipients) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');

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
	 * @param {Buffer} cipherData - The data to decrypt.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @returns {Buffer} - Decrypted data
	 * */
	function decrypt(cipherData, privateKey) {
		assert(isBuffer(cipherData), 'Argument "cipherData" must be a Buffer.');

		var keyData = getKeyBytesFromHandle(privateKey);
		return VirgilCrypto.decrypt(cipherData, keyData.recipientId, keyData.value);
	}

	/**
	 * Signs the data with the private key.
	 *
	 * @param {Buffer} data - The data to sign.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @reutrns {Buffer} - The signature.
	 * */
	function sign(data, privateKey) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');

		var keyData = getKeyBytesFromHandle(privateKey);
		return VirgilCrypto.sign(data, keyData.value);
	}

	/**
	 * Verifies the signature using the public key.
	 *
	 * @param {Buffer} data - The data to authenticate.
	 * @param {Buffer} signature - The signature.
	 * @param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * @returns {Boolean} - {code: true} if verification is successful,
	 * 			otherwise {code: false}
	 * */
	function verify(data, signature, publicKey) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');
		assert(isBuffer(signature), 'Argument "signature" must be a Buffer.');
		var keyData = getKeyBytesFromHandle(publicKey);
		return VirgilCrypto.verify(data, signature, keyData.value);
	}

	/**
	 * Signs the data with the private key, then encrypts the data with
	 * 		attached signature with the public key(s).
	 * @param {Buffer} data - The data to sign and encrypt.
	 * @param {CryptoKeyHandle} privateKey - The private key handle.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} publicKeys - The handle
	 * 		of a public key of the intended recipient or an array of
	 * 		public key handles of multiple recipients.
	 *
	 * 	@returns {Buffer} Encrypted data with attached signature.
	 * */
	function signThenEncrypt(data, privateKey, publicKeys) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');

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
	 * Decrypts the cipher data with the private key, then verifies
	 * 		the signature with the public key.
	 * 	@param {Buffer} cipherData - The data to decrypt and verify.
	 * 	@param {CryptoKeyHandle} privateKey - The private key handle.
	 * 	@param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * 	@returns {Buffer} - Decrypted data iff verification is successful,
	 * 			otherwise throws {code: VirgilCryptoError}.
	 * */
	function decryptThenVerify(cipherData, privateKey, publicKey) {
		assert(isBuffer(cipherData), 'Argument "cipherData" must be a Buffer.');

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
	 * @param {Buffer} data - The data to get the fingerprint of.
	 *
	 * @returns {Buffer} - The fingerprint.
	 * */
	function calculateFingerprint(data) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');
		return VirgilCrypto.hash(data, VirgilCrypto.HashAlgorithm.SHA256);
	}

	/**
	 * Calculates the hash of the given data.
	 *
	 * @param {Buffer} data - The data to get the hash of.
	 * @param {string} [algorithm] - Optional name of the hash algorithm
	 * 		to use. See { code: virgilCrypto.HashAlgorithm }
	 * 		for available options.
	 *
	 * @returns {Buffer} - The hash.
	 * */
	function hash(data, algorithm) {
		assert(isBuffer(data), 'Argument "data" must be a Buffer.');
		return VirgilCrypto.hash(data, algorithm);
	}

	/**
	 * Encrypts the data using the password to derive encryption key.
	 *
	 * @param {Buffer} data - The data to encrypt.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Encrypted data.
	 * */
	function encryptWithPassword (data, password) {
		return VirgilCrypto.encrypt(data, stringToBuffer(password));
	}

	/**
	 * Decrypts the cipher data using the password to derive decryption key.
	 *
	 * @param {Buffer} cipherData - The data to decrypt.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Decrypted data.
	 * */
	function decryptWithPassword (cipherData, password) {
		return VirgilCrypto.decrypt(cipherData, stringToBuffer(password));
	}
}

module.exports = virgilCrypto;
