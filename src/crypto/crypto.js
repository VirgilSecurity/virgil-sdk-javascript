/**
 * Interface for classes that provide implementation of cryptographic
 * operations.
 *
 * @interface Crypto
 */

/**
 * Generates a new key pair.
 *
 * @function
 * @name Crypto#generateKeys
 * @param {KeyPairType} [keyPairType] - Optional type of the key pair.
 * 			See {code: virgil.crypto.KeyPairType} for available options.
 * @returns {KeyPair}:
 * 			The newly generated key pair.
 * */

/**
 * Imports a private key from a Buffer or base64-encoded string
 * containing key material.
 *
 * @function
 * @name Crypto#importPrivateKey
 * @param {Buffer|string} keyMaterial - The private key material
 * 			as a {Buffer} or base64-encoded string.
 * @param {string} [password] - Optional password the key is
 * 			encrypted with.
 *
 * @returns {CryptoKeyHandle} - The imported key handle.
 * */

/**
 * Imports a public key from a Buffer or base64-encoded string
 * containing key material.
 *
 * @function
 * @name Crypto#importPublicKey
 * @param {Buffer|string} publicKeyMaterial - The public key material
 * 			as a {Buffer} or base64-encoded string.
 *
 * @returns {CryptoKeyHandle} - The imported key handle.
 * */

/**
 * Exports the private key handle into a Buffer containing the key bytes.
 *
 * @function
 * @name Crypto#exportPrivateKey
 * @param {CryptoKeyHandle} privateKey - The private key handle.
 * @param {string} [password] - Optional password to encrypt the key with.
 *
 * @returns {Buffer} - The private key bytes.
 * */

/**
 * Exports the public key handle into a Buffer containing the key bytes.
 *
 * @function
 * @name Crypto#exportPublicKey
 * @param {CryptoKeyHandle} publicKey - The public key handle.
 *
 * @returns {Buffer} - The public key bytes.
 * */

/**
 * Extracts a public key from the private key handle.
 *
 * @function
 * @name Crypto#extractPublicKey
 * @param {CryptoKeyHandle} privateKey - The private key handle.
 * 			to extract from.
 * @param {string} [password=''] - Optional password the private key
 * 			is encrypted with.
 *
 * @returns {CryptoKeyHandle} - The handle to the extracted public key.
 * */

/**
 * Encrypts the data for the recipient(s).
 *
 * @function
 * @name Crypto#encrypt
 * @param {Buffer|string} data - The data to be encrypted as a {Buffer}
 * 			or a {string} in UTF8.
 * @param {CryptoKeyHandle|CryptoKeyHandle[]} recipients - A handle to
 * 			the public key of the intended recipient or an array of public
 * 			key handles of multiple recipients.
 *
 * @returns {Buffer} - Encrypted data.
 * */

/**
 * Decrypts the data with the private key.
 *
 * @function
 * @name Crypto#decrypt
 * @param {Buffer|string} cipherData - The data to be decrypted as
 * 			a {Buffer} or a {string} in base64.
 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
 *
 * @returns {Buffer} - Decrypted data
 * */

/**
 * Calculates the signature on the data.
 *
 * @function
 * @name Crypto#sign
 * @param {Buffer|string} data - The data to be signed as a {Buffer} or a
 * 			{string} in UTF-8.
 * @param {CryptoKeyHandle} privateKey - A handle to the private key.
 *
 * @returns {Buffer} - The signature.
 * */

/**
 * Verifies the provided data using the given signature and public key.
 *
 * * @function
 * @name Crypto#verify
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

/**
 * Calculates the signature on the data using the private key,
 * 		then encrypts the data along with the signature using
 * 		the public key(s).
 *
 * @function
 * @name Crypto#signThenEncrypt
 *
 * @param {Buffer|string} data - The data to sign and encrypt as a
 * 			{Buffer} or a {string} in UTF-8.
 * @param {CryptoKeyHandle} privateKey - The private key handle.
 * @param {CryptoKeyHandle|CryptoKeyHandle[]} publicKeys - The handle
 * 		of a public key of the intended recipient or an array of
 * 		public key handles of multiple recipients.
 *
 * 	@returns {Buffer} Encrypted data with attached signature.
 * */

/**
 * Decrypts the data using the private key, then verifies decrypted data
 * 		using the attached signature and the given public key.
 *
 * @function
 * @name Crypto#decryptThenVerify
 *
 * @param {Buffer|string} cipherData - The data to be decrypted and
 * 			verified as a {Buffer} or a {string} in base64.
 * @param {CryptoKeyHandle} privateKey - The private key handle.
 * @param {CryptoKeyHandle} publicKey - The public key handle.
 *
 * @returns {Buffer} - Decrypted data iff verification is successful,
 * 			otherwise throws {code: VirgilCryptoError}.
 * */

/**
 * Calculates the fingerprint of the given data.
 *
 * @function
 * @name Crypto#calculateFingerprint
 *
 * @param {Buffer|string} data - The data to calculate the fingerprint of
 * 			as a {Buffer} or a {string} in UTF-8.
 *
 * @returns {Buffer} - The fingerprint.
 * */

/**
 * Calculates the hash of the given data.
 *
 * @function
 * @name Crypto#hash
 *
 * @param {Buffer|string} data - The data to calculate the hash of as a
 * 			{Buffer} or a {string} in UTF-8.
 * @param {string} [algorithm] - Optional name of the hash algorithm
 * 		to use. See { code: virgilCrypto.HashAlgorithm }
 * 		for available options.
 *
 * @returns {Buffer} - The hash.
 * */
