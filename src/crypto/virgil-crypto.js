var VirgilCrypto = require('virgil-crypto');
var CryptoKeyHandle = require('./crypto-key-handle');
var isBuffer = require('../shared/utils').isBuffer;
var isString = require('../shared/utils').isString;
var assert = require('../shared/utils').assert;
var stringToBuffer = require('../shared/utils').stringToBuffer;
var base64Decode = require('../shared/utils').base64Decode;
var toArray = require('../shared/utils').toArray;

VirgilCrypto = VirgilCrypto.VirgilCrypto || VirgilCrypto;

/**
 * Represents a pair of cryptographic keys generated with an
 * asymmetric algorithm.
 *
 * @typedef {Object} KeyPair
 * @property {CryptoKeyHandle} privateKey - Private part of the key
 * @property {CryptoKeyHandle} publicKey - Public part of the key
 */

/**
 * @constructs VirgilCrypto
 * */
function virgilCrypto() {

	var keyMaterialStore = new WeakMap();

	return /** @lends {VirgilCrypto} @implements {Crypto} */ {
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
		/** @enum {object} */
		HashAlgorithm: VirgilCrypto.HashAlgorithm,
		/**
		 * Enumeration of supported key types.
		 * @readonly
		 * @enum {string}
		 * */
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

	function createPrivateKeyHandle(recipientId, value) {
		return createKeyHandle('private', recipientId, value);
	}

	function createPublicKeyHandle(recipientId, value) {
		return createKeyHandle('public', recipientId, value);
	}

	/**
	 * Returns the key material corresponding to the key handle.
	 *
	 * @returns {{recipientId: Buffer, value: Buffer}} - The key data.
	 *
	 * @private
	 * */
	function getKeyBytesFromHandle (keyHandle) {
		return keyMaterialStore.get(keyHandle);
	}

	/**
	 * Generates a new key pair.
	 *
	 * @param {KeyPairType} [keyPairType] - Optional type of the key pair.
	 * 			See {code: virgil.crypto.KeyPairType} for available options.
	 * @returns {KeyPair}:
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
	 * @param {Buffer|string} keyMaterial - The private key material
	 * 			as a {Buffer} or base64-encoded string.
	 * @param {string} [password] - Optional password the key is
	 * 			encrypted with.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPrivateKey(keyMaterial, password) {
		assert(isBuffer(keyMaterial) || isString(keyMaterial),
			'importPrivateKey expects keyMaterial argument to be a Buffer ' +
			'or a base64-encoded string. Got ' + typeof keyMaterial);

		var keyBytes = isString(keyMaterial)
			? base64Decode(keyMaterial) : keyMaterial;

		if (password) {
			keyBytes = VirgilCrypto.decryptPrivateKey(
				keyBytes, stringToBuffer(password));
		}

		var privateKeyDER = VirgilCrypto.privateKeyToDER(keyBytes);
		var publicKey = VirgilCrypto.extractPublicKey(privateKeyDER);
		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKey);

		return createPrivateKeyHandle(
			VirgilCrypto.hash(publicKeyDER), privateKeyDER);
	}

	/**
	 * Imports a public key from a Buffer or base64-encoded string
	 * containing key material.
	 *
	 * @param {Buffer|string} publicKeyMaterial - The public key material
	 * 			as a {Buffer} or base64-encoded string.
	 *
	 * @returns {CryptoKeyHandle} - The imported key handle.
	 * */
	function importPublicKey(publicKeyMaterial) {
		assert(isBuffer(publicKeyMaterial) || isString(publicKeyMaterial),
			'importPublicKey expects publicKeyMaterial argument to be a ' +
			'Buffer or a base64-encoded string. ' +
			'Got ' + typeof publicKeyMaterial);

		var publicKeyBytes = isString(publicKeyMaterial)
			? base64Decode(publicKeyMaterial) : publicKeyMaterial;

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
		assert(keyData, 'exportPrivateKey expects privateKey argument to be ' +
			'a valid private key handle.');

		if (!isString(password)) {
			return keyData.value;
		}

		var passwordBuffer = stringToBuffer(password);
		return VirgilCrypto.encryptPrivateKey(keyData.value, passwordBuffer);
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

		assert(keyData, 'exportPublicKey expects publicKey argument to be ' +
			'a valid public key handle.');

		return keyData.value;
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

		assert(keyData, 'extractPublicKey expects privateKey argument to be ' +
			'a valid private key handle.');

		password = isString(password) || '';

		var publicKey = VirgilCrypto.extractPublicKey(
			keyData.value, stringToBuffer(password));
		return createPublicKeyHandle(keyData.recipientId, publicKey);
	}

	/**
	 * Encrypts the data for the recipient(s).
	 *
	 * @param {Buffer|string} data - The data to be encrypted as a {Buffer}
	 * 			or a {string} in UTF8.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} recipients - A handle to
	 * 			the public key of the intended recipient or an array of public
	 * 			key handles of multiple recipients.
	 *
	 * @returns {Buffer} - Encrypted data.
	 * */
	function encrypt(data, recipients) {
		assert(isBuffer(data) || isString(data),
			'encrypt expects data argument to be passed as a Buffer or ' +
			'a string. Got ' + typeof data);

		data = isString(data) ? stringToBuffer(data) : data;
		recipients = toArray(recipients);

		var publicKeys = recipients.map(function (recipientKey) {
			var keyData = getKeyBytesFromHandle(recipientKey);

			assert(keyData, 'encrypt expects recipients argument to be a valid' +
				' public key handle or an array of valid public key handles.');

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
	 * @param {Buffer|string} cipherData - The data to be decrypted as
	 * 			a {Buffer} or a {string} in base64.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @returns {Buffer} - Decrypted data
	 * */
	function decrypt(cipherData, privateKey) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'decrypt expects cipherData argument to be passed as a Buffer ' +
			'or a base64-encoded string. Got ' + typeof cipherData);

		var keyData = getKeyBytesFromHandle(privateKey);

		assert(keyData, 'decrypt expects privateKey argument to be a valid ' +
			'key handle.');

		cipherData = isString(cipherData)
			? base64Decode(cipherData) : cipherData;


		return VirgilCrypto.decrypt(
			cipherData, keyData.recipientId, keyData.value);
	}

	/**
	 * Calculates the signature on the data.
	 *
	 * @param {Buffer|string} data - The data to be signed as a {Buffer} or a
	 * 			{string} in UTF-8.
	 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
	 *
	 * @returns {Buffer} - The signature.
	 * */
	function sign(data, privateKey) {
		assert(isBuffer(data) || isString(data),
			'sign expects data argument to be passed as a Buffer or ' +
			'a string. Got ' + typeof data);

		var keyData = getKeyBytesFromHandle(privateKey);

		assert(keyData, 'sign expects privateKey argument to be a valid ' +
			'key handle.');

		data = isString(data) ? stringToBuffer(data) : data;

		return VirgilCrypto.sign(data, keyData.value);
	}

	/**
	 * Verifies the provided data using the given signature and public key.
	 *
	 * @param {Buffer|string} data - The data to be verified as a {Buffer}
	 * 			or a {string} in UTF-8.
	 * @param {Buffer|string} signature - The signature as a {Buffer} or a
	 * 			{string} in base64.
	 * @param {CryptoKeyHandle} publicKey - The public key handle.
	 *
	 * @returns {Boolean} - {code: true} or {code: false} depending on the
	 * 			validity of the signature for the data and public key.
	 * */
	function verify(data, signature, publicKey) {
		assert(isBuffer(data) || isString(data),
			'verify expects data argument to be passed as a Buffer or ' +
			'a string. Got ' + typeof data);

		assert(isBuffer(signature) || isString(data),
			'verify expects signature argument to be passed as a Buffer ' +
			'or a base64-encoded string. Got ' + typeof data);

		var keyData = getKeyBytesFromHandle(publicKey);

		assert(keyData, 'verify expects publicKey argument to be a valid ' +
			'key handle.');

		data = isString(data) ? stringToBuffer(data) : data;
		signature = isString(signature)
			? base64Decode(signature) : signature;


		return VirgilCrypto.verify(data, signature, keyData.value);
	}

	/**
	 * Calculates the signature on the data using the private key,
	 * 		then encrypts the data along with the signature using
	 * 		the public key(s).
	 * @param {Buffer|string} data - The data to sign and encrypt as a
	 * 			{Buffer} or a {string} in UTF-8.
	 * @param {CryptoKeyHandle} privateKey - The private key handle.
	 * @param {CryptoKeyHandle|CryptoKeyHandle[]} recipients - The handle
	 * 		of a public key of the intended recipient or an array of
	 * 		public key handles of multiple recipients.
	 *
	 * 	@returns {Buffer} Encrypted data with attached signature.
	 * */
	function signThenEncrypt(data, privateKey, recipients) {
		assert(isBuffer(data) || isString(data),
			'signThenEncrypt expects data argument to be passed as a Buffer ' +
			'or a string. Got ' + typeof data);

		var privateKeyData = getKeyBytesFromHandle(privateKey);

		assert(privateKeyData, 'signThenEncrypt expects privateKey argument ' +
			' to be a valid key handle.');

		data = isString(data) ? stringToBuffer(data) : data;
		recipients = toArray(recipients);

		var publicKeys = recipients.map(function (recipient) {
			var pubKeyData = getKeyBytesFromHandle(recipient);

			assert(pubKeyData, 'signThenEncrypt expects recipients argument ' +
				'to be a valid key handle or an array of valid key handles.');

			return {
				recipientId: pubKeyData.recipientId,
				publicKey: pubKeyData.value
			};
		});

		return VirgilCrypto.signThenEncrypt(
			data,
			{
				privateKey: privateKeyData.value,
				recipientId: privateKeyData.recipientId
			},
			publicKeys);
	}

	/**
	 * Decrypts the data using the private key, then verifies decrypted data
	 * 		using the attached signature and the given public key.
	 *
	 * 	@param {Buffer|string} cipherData - The data to be decrypted and
	 * 			verified as a {Buffer} or a {string} in base64.
	 * 	@param {CryptoKeyHandle} privateKey - The private key handle.
	 * 	@param {(CryptoKeyHandle|CryptoKeyHandle[])} publicKey - The public
	 * 		key handle or an array of public key handles. If `publicKey`
	 * 		is an array, the attached signature can be verified by any of them.
	 *
	 * 	@returns {Buffer} - Decrypted data iff verification is successful,
	 * 			otherwise throws {code: VirgilCryptoError}.
	 * */
	function decryptThenVerify(cipherData, privateKey, publicKey) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'decryptThenVerify expects cipherData argument to be passed as ' +
			'a Buffer or a base64-encoded string. Got ' + typeof cipherData);

		var privateKeyData = getKeyBytesFromHandle(privateKey);
		var verifiers;

		publicKey = toArray(publicKey);
		assert(publicKey, 'decryptThenVerify expects publicKey argument to ' +
			'be passed.');

		verifiers = publicKey.map(function (handle) {
			var publicKeyData = getKeyBytesFromHandle(handle);
			assert(publicKeyData, 'decryptThenVerify expects publicKey argument ' +
				'to be a valid key handle.');
			return {
				publicKey: publicKeyData.value,
				recipientId: publicKeyData.recipientId
			};
		});

		assert(privateKeyData, 'decryptThenVerify expects privateKey argument' +
			' to be a valid key handle.');

		cipherData = isString(cipherData)
			? base64Decode(cipherData) : cipherData;

		return VirgilCrypto.decryptThenVerify(
			cipherData,
			privateKeyData.recipientId,
			privateKeyData.value,
			verifiers);
	}

	/**
	 * Calculates the fingerprint of the given data.
	 *
	 * @param {Buffer|string} data - The data to calculate the fingerprint of
	 * 			as a {Buffer} or a {string} in UTF-8.
	 *
	 * @returns {Buffer} - The fingerprint.
	 * */
	function calculateFingerprint(data) {
		return hash(data, VirgilCrypto.HashAlgorithm.SHA256);
	}

	/**
	 * Calculates the hash of the given data.
	 *
	 * @param {Buffer|string} data - The data to calculate the hash of as a
	 * 			{Buffer} or a {string} in UTF-8.
	 * @param {string} [algorithm] - Optional name of the hash algorithm
	 * 		to use. See { code: virgilCrypto.HashAlgorithm }
	 * 		for available options.
	 *
	 * @returns {Buffer} - The hash.
	 * */
	function hash(data, algorithm) {
		assert(isBuffer(data) || isString(data),
			'hash expects data argument to be passed as a Buffer or ' +
			'a string. Got ' + typeof data);

		data = isString(data) ? stringToBuffer(data) : data;
		return VirgilCrypto.hash(data, algorithm);
	}

	/**
	 * Encrypts the data using the password to derive encryption key.
	 *
	 * @param {Buffer|string} data - The data to be encrypted as a {Buffer}
	 * 			or a {string} in UTF-8.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Encrypted data.
	 * */
	function encryptWithPassword (data, password) {
		assert(isBuffer(data) || isString(data),
			'encryptWithPassword expects data argument to be passed as ' +
			'a Buffer or a string. Got ' + typeof data);

		assert(isString(password), 'encryptWithPassword expects password ' +
			'argument to be passed as a string. Got ' + typeof password);

		data = isString(data) ? stringToBuffer(data) : data;

		return VirgilCrypto.encrypt(data, stringToBuffer(password));
	}

	/**
	 * Decrypts the encrypted data using the password to derive decryption key.
	 *
	 * @param {Buffer|string} cipherData - The data to be decrypted as a
	 * 			{Buffer} or a {string} in base64.
	 * @param {string} password - The password to use for key derivation.
	 *
	 * @returns {Buffer} Decrypted data.
	 * */
	function decryptWithPassword (cipherData, password) {
		assert(isBuffer(cipherData) || isString(cipherData),
			'decryptWithPassword expects cipherData argument to be passed as' +
			' a Buffer or a base64-encoded string. Got ' + typeof cipherData);

		assert(isString(password), 'decryptWithPassword expects password ' +
			'argument to be passed as a string. Got ' + typeof password);

		cipherData = isString(cipherData) ? base64Decode(cipherData) : cipherData;

		return VirgilCrypto.decrypt(cipherData, stringToBuffer(password));
	}
}

module.exports = virgilCrypto();
