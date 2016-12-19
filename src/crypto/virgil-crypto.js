var VirgilCrypto = require('virgil-crypto');
var cryptoAsyncPatch = require('../crypto-async-patch');

VirgilCrypto = VirgilCrypto.VirgilCrypto || VirgilCrypto;

cryptoAsyncPatch(VirgilCrypto);

/**
 * Private key handle.
 * @typedef {Object} PrivateKeyHandle
 */

/**
 * Public key handle.
 * @typedef {Object} PublicKeyHandle
 */

/**
 * Represents key pair.
 * @typedef {Object} KeyPair
 * @property {PrivateKeyHandle} privateKey - Private part of the key
 * @property {PublicKeyHandle} publicKey - Public part of the key
 */

var keyValueStore = new WeakMap();

function virgilCrypto() {

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
		KeyPairType: VirgilCrypto.KeysTypesEnum
	};

	function createPrivateKey(recipientId, value) {
		var privateKey = {};
		keyValueStore.set(privateKey, { recipientId: recipientId, value: value });
		return privateKey;
	}

	function createPublicKey(recipientId, value) {
		var publicKey = {};
		keyValueStore.set(publicKey, { recipientId: recipientId, value: value });
		return publicKey;
	}

	/**
	 * Generates new key pair.
	 *
	 * @param {string} [keyPairType] - Type of key pair. See virgilCrypto.KeyPairType for available options
	 * @returns {object}
	 * */
	function generateKeys(keyPairType) {
		var keyPair = VirgilCrypto.generateKeyPair({ type: keyPairType });
		var publicKeyDER = VirgilCrypto.publicKeyToDER(keyPair.publicKey);
		var privateKeyDER = VirgilCrypto.privateKeyToDER(keyPair.privateKey);
		var keyPairId = VirgilCrypto.hash(publicKeyDER);

		return {
			privateKey: createPrivateKey(keyPairId, privateKeyDER),
			publicKey: createPublicKey(keyPairId, publicKeyDER)
		};
	}

	/**
	 * Imports private key from material representation.
	 *
	 * @param {Buffer} rawPrivateKey - Private key bytes
	 * @param {string} [password] - Password the key is encrypted with
	 *
	 * @returns {PrivateKey}
	 * */
	function importPrivateKey(rawPrivateKey, password) {
		if (!Buffer.isBuffer(rawPrivateKey)) {
			throw new TypeError('Unexpected type of "rawPrivateKey", use Buffer.');
		}

		if (arguments.length === 2) {
			rawPrivateKey = VirgilCrypto.decryptPrivateKey(rawPrivateKey, new Buffer(password));
		}

		var privateKeyDER = VirgilCrypto.privateKeyToDER(rawPrivateKey);
		var publicKey = VirgilCrypto.extractPublicKey(privateKeyDER);
		var publicKeyDER = VirgilCrypto.publicKeyToDER(publicKey);

		return createPrivateKey(VirgilCrypto.hash(publicKeyDER), privateKeyDER);
	}

	/**
	 * Imports public key from material representation.
	 *
	 * @param {Buffer} rawPublicKey - Public key bytes
	 *
	 * @returns {PublicKey}
	 * */
	function importPublicKey(rawPublicKey) {
		if (!Buffer.isBuffer(rawPublicKey)) {
			throw new TypeError('Unexpected type of "rawPublicKey", use Buffer.');
		}

		var publicKeyDER = VirgilCrypto.publicKeyToDER(rawPublicKey);

		return createPublicKey(VirgilCrypto.hash(publicKeyDER), publicKeyDER);
	}

	/**
	 * Exports private key into material representation.
	 *
	 * @param {PrivateKey} privateKey - Private key to export
	 * @param {string} [password] - Password to encrypt the key with
	 *
	 * @returns {Buffer}
	 * */
	function exportPrivateKey(privateKey, password) {
		var keyData = keyValueStore.get(privateKey);
		if (!keyData) {
			throw new Error('Cannot export private key. Object passed is not a valid private key.');
		}

		if (!password) {
			return VirgilCrypto.privateKeyToDER(keyData.value);
		}

		var passwordBuffer = new Buffer(password);
		var encryptedKey = VirgilCrypto.encryptPrivateKey(keyData.value, passwordBuffer);
		return VirgilCrypto.privateKeyToDER(encryptedKey, passwordBuffer);
	}

	/**
	 * Exports public key into material representation.
	 *
	 * @param {PublicKey} publicKey - Public key to export
	 *
	 * @returns {Buffer}
	 * */
	function exportPublicKey(publicKey) {
		var keyData = keyValueStore.get(publicKey);
		if (!keyData) {
			throw new Error('Cannot export public key. Object passed is not a valid public key.');
		}

		return VirgilCrypto.publicKeyToDER(keyData.value);
	}

	/**
	 * Extracts public key from private key.
	 *
	 * @param {PrivateKey} privateKey
	 * @param {string} [password=''] - Password the private key is encrypted with
	 *
	 * @returns {PublicKey}
	 * */
	function extractPublicKey(privateKey, password) {
		var keyData = keyValueStore.get(privateKey);
		if (!keyData) {
			throw new Error('Cannot extract public key. Object passed is not a valid private key.');
		}

		password = password || '';

		var publicKey = VirgilCrypto.extractPublicKey(keyData.value, new Buffer(password));
		return createPublicKey(keyData.recipientId, VirgilCrypto.publicKeyToDER(publicKey));
	}

	/**
	 * Encrypts the data for recipients.
	 *
	 * @param {Buffer} data - Data to encrypt
	 * @param {PublicKeyHandle|PublicKeyHandle[]} recipients - Public keys to encrypt the data with.
	 *
	 * @returns {Buffer} - Encrypted data
	 * */
	function encrypt(data, recipients) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot encrypt the given data. Argument "data" must be a Buffer.');
		}

		recipients = Array.isArray(recipients) ? recipients : [recipients];

		var publicKeys = recipients.map(function (recipient) {
			var keyData = keyValueStore.get(recipient);
			if (!keyData) {
				throw new Error('Cannot encrypt data. Object passed is not a valid public key.');
			}

			return {
				recipientId: keyData.recipientId,
				publicKey: keyData.value
			};
		});

		return VirgilCrypto.encrypt(data, publicKeys);
	}

	/**
	 * Decrypts the data with private key.
	 *
	 * @param {Buffer} cipherData - Encrypted data
	 * @param {PrivateKeyHandle} privateKey - Private key to decrypt with
	 *
	 * @returns {Buffer} - Decrypted data
	 * */
	function decrypt(cipherData, privateKey) {
		if (!Buffer.isBuffer(cipherData)) {
			throw new TypeError('Cannot decrypt the given data. Argument "cipherData" must be a Buffer.');
		}

		var keyData = keyValueStore.get(privateKey);
		if (!keyData) {
			throw new Error('Cannot decrypt with given key. Object passed is not a valid private key.');
		}

		return VirgilCrypto.decrypt(cipherData, keyData.recipientId, keyData.value);
	}

	/**
	 * Signs the data with private key.
	 *
	 * @param {Buffer} data - Data to sign
	 * @param {PrivateKeyHandle} privateKey - Private key to sign with
	 * */
	function sign(data, privateKey) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot sign the given data. Argument "data" must be a Buffer.');
		}

		var keyData = keyValueStore.get(privateKey);
		if (!keyData) {
			throw new Error('Cannot sign with given key. Object passed is not a valid private key');
		}

		return VirgilCrypto.sign(data, keyData.value);
	}

	/**
	 * Verifies the signature using public key.
	 *
	 * @param {Buffer} data - The data to verify signature of
	 * @param {Buffer} signature - The signature to verify
	 * @param {PublicKeyHandle} publicKey - Public key to verify with
	 *
	 * @returns {Boolean}
	 * */
	function verify(data, signature, publicKey) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot verify the signature. Argument "data" must be a Buffer.');
		}

		if (!Buffer.isBuffer(signature)) {
			throw new TypeError('Cannot verify the signature. Argument "signature" must be a Buffer.');
		}

		var keyData = keyValueStore.get(publicKey);
		if (!keyData) {
			throw new Error('Cannot verify the signature. Object provided is not a valid public key.');
		}

		return VirgilCrypto.verify(data, signature, keyData.value);
	}

	/**
	 * Signs the data with private key, then encrypts the data with attached
	 * 		signature with public keys.
	 * @param {Buffer} data
	 * @param {PrivateKeyHandle} privateKey
	 * @param {PublicKeyHandle|PublicKeyHandle[]} publicKeys Recipient's
	 * 		public key or array of recipients' public keys.
	 * 	@returns {Buffer} Encrypted data with attached signature.
	 * */
	function signThenEncrypt(data, privateKey, publicKeys) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot sign and encrypt. Argument "data" must be a Buffer.');
		}

		var privateKeyData = keyValueStore.get(privateKey);
		if (!privateKeyData) {
			throw new Error('Object provided is not a valid private key');
		}

		publicKeys = Array.isArray(publicKeys) ? publicKeys : [publicKeys];
		var recipients = publicKeys.map(function (publicKey) {
			var pubKeyData = keyValueStore.get(publicKey);
			if (!pubKeyData) {
				throw new Error('Object provided is not a valid public key');
			}

			return {
				recipientId: pubKeyData.recipientId,
				publicKey: pubKeyData.value
			};
		});

		return VirgilCrypto.signThenEncrypt(data, privateKeyData.value, recipients);
	}

	/**
	 * Decrypts the cipher data with private key, then verifies the signature
	 * 		with public key.
	 * 	@param {Buffer} cipherData
	 * 	@param {PrivateKeyHandle} privateKey
	 * 	@param {PublicKeyHandle} publicKey
	 * 	@returns {Buffer} Decrypted data iff verification is successful,
	 * 			otherwise throws {!VirgilCryptoError}.
	 * */
	function decryptThenVerify(cipherData, privateKey, publicKey) {
		if (!Buffer.isBuffer(cipherData)) {
			throw new TypeError('Argument "cipherData" must be a Buffer.');
		}

		var privateKeyData = keyValueStore.get(privateKey);
		if (!privateKeyData) {
			throw new Error('Object provided is not a valid private key');
		}

		var publicKeyData = keyValueStore.get(publicKey);
		if (!publicKeyData) {
			throw new Error('Object provided is not a valid public key');
		}

		return VirgilCrypto.decryptThenVerify(
			cipherData,
			privateKeyData.recipientId,
			privateKeyData.value,
			publicKeyData.value);
	}

	/**
	 * Calculates the fingerprint of given data
	 *
	 * @param {Buffer} data
	 *
	 * @returns {Buffer} - Fingerprint
	 * */
	function calculateFingerprint(data) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot calculate fingerprint. Argument "data" must be a Buffer.')
		}

		return VirgilCrypto.hash(data, VirgilCrypto.HashAlgorithm.SHA256);
	}

	/**
	 * Calculates the hash of given data
	 *
	 * @param {Buffer} data
	 * @param {string} [algorithm] - Hash algorithm to use. See virgilCrypto.HashAlgorithm for available options
	 *
	 * @returns {Buffer} - Hash
	 * */
	function hash(data, algorithm) {
		if (!Buffer.isBuffer(data)) {
			throw new TypeError('Cannot hash data. Argument "data" must be a Buffer.')
		}

		return VirgilCrypto.hash(data, algorithm);
	}

	/**
	 * Encrypts the data using password to derive encryption key.
	 * @param {Buffer} data
	 * @param {string} password
	 * @returns {Buffer} Encrypted data.
	 * */
	function encryptWithPassword (data, password) {
		return VirgilCrypto.encrypt(data, new Buffer(password));
	}

	/**
	 * Decrypts the cipher data using password to derive decryption key.
	 * @param {Buffer} cipherData
	 * @param {string} password
	 * @returns {Buffer} Decrypted data.
	 * */
	function decryptWithPassword (cipherData, password) {
		return VirgilCrypto.decrypt(cipherData, new Buffer(password));
	}
}

module.exports = virgilCrypto;
